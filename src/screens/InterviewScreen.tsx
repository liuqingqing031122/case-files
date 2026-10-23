import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { availableTopics, findSuspect, topicKey, type StatementDef } from '../engine';
import BackLink from '../components/BackLink';
import EvidenceCard from '../components/EvidenceCard';
import EvidencePicker from '../components/EvidencePicker';
import { scrollBehavior } from '../components/motion';
import Portrait from '../components/Portrait';
import { pressFeedback, topicFeedback, type Feedback } from '../game/feedback';
import { useGame } from '../game/GameContext';
import { INTERVIEW_STATUS_LABELS, interviewStatus } from '../game/interviewStatus';
import { SUSPECT_INFO } from '../game/uiContent';
import './InterviewScreen.css';

type Tab = 'statements' | 'topics';

export default function InterviewScreen({ suspectId }: { suspectId: string }) {
  const { data, state, act, go } = useGame();
  const [tab, setTab] = useState<Tab>('statements');
  // Each tab keeps its own latest exchange, shown only inside that tab.
  const [exchanges, setExchanges] = useState<Record<Tab, Feedback | null>>({ statements: null, topics: null });
  const [pressing, setPressing] = useState<StatementDef | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLElement>(null);
  const suspect = findSuspect(data, suspectId);

  const exchange = exchanges[tab];
  useEffect(() => {
    if (exchange) feedbackRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  }, [exchange]);

  if (!suspect) return null;
  const available = availableTopics(suspect, state);
  const held = state.evidence.map((id) => data.evidence[id]);
  const status = interviewStatus(suspect, state);

  const present = (evidenceId: string) => {
    if (!pressing) return;
    const next = act({ type: 'press', suspectId, statementId: pressing.id, evidenceId });
    setPressing(null);
    setExchanges((prev) => ({ ...prev, statements: pressFeedback(data, next.lastEvent, data.startingCredibility) }));
  };

  const ask = (topicId: string, label: string) => {
    const next = act({ type: 'askTopic', suspectId, topicId });
    setExchanges((prev) => ({ ...prev, topics: topicFeedback(data, next.lastEvent, label) }));
  };

  const exchangePanel = exchange && (
    <section ref={feedbackRef} className={`exchange exchange-${exchange.tone}`} aria-live="polite">
      {exchange.tone === 'success' ? (
        <p className="exchange-stamp">{exchange.heading}</p>
      ) : (
        <p className="exchange-heading">{exchange.heading}</p>
      )}
      {exchange.lines.map((line) => (
        <p key={line} className={line.startsWith('(') ? 'exchange-action' : 'exchange-line'}>
          {line.startsWith('(') ? line : `“${line}”`}
        </p>
      ))}
      {exchange.credibilityNote && <p className="exchange-cred">{exchange.credibilityNote}</p>}
      {exchange.gained.length > 0 && (
        <div className="exchange-gained">
          <span>Added to case file:</span>
          {exchange.gained.map((card) => (
            <button key={card.id} className="gained-chip" onClick={() => setViewing(card.id)}>
              {card.id} · {card.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'statements', label: 'Statements', count: suspect.statements.length },
    { id: 'topics', label: 'Ask about', count: available.length },
  ];

  // Standard tabs keyboard pattern: arrows move between tabs, Home/End jump.
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const ids = tabs.map((t) => t.id);
    const current = ids.indexOf(tab);
    const next =
      e.key === 'ArrowRight' ? (current + 1) % ids.length
      : e.key === 'ArrowLeft' ? (current - 1 + ids.length) % ids.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? ids.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(ids[next]);
    document.getElementById(`tab-${ids[next]}`)?.focus();
  };

  return (
    <main className="page">
      <BackLink label="Back to Suspects" onClick={() => go({ name: 'suspects' })} />

      <header className="interview-profile">
        <Portrait suspectId={suspect.id} size={84} />
        <div className="interview-identity">
          <p className="page-kicker">Interview</p>
          <h1 className="interview-name">{suspect.name}</h1>
          <p className="interview-role">{SUSPECT_INFO[suspect.id]?.role}</p>
          <p className={`interview-status is-${status}`}>{INTERVIEW_STATUS_LABELS[status]}</p>
        </div>
      </header>

      <p className="interview-howto">
        <strong>Challenge</strong> a statement by presenting evidence that contradicts it, or <strong>ask</strong>{' '}
        about a topic to learn more.
      </p>

      <div className="interview-tabs" role="tablist" aria-label="Interview actions" onKeyDown={onTabKey}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={`interview-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="interview-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'statements' ? (
        <section id="panel-statements" role="tabpanel" aria-labelledby="tab-statements">
          <p className="panel-intro">Their account of last night. Spot a lie? Present the evidence that disproves it.</p>
          {exchangePanel}
          <ol className="statement-list">
            {suspect.statements.map((statement) => {
              const broken = !!statement.contradiction && state.contradictions.includes(statement.contradiction.id);
              return (
                <li key={statement.id} className={`statement${broken ? ' is-broken' : ''}`}>
                  <p className="statement-text">“{statement.text}”</p>
                  {broken ? (
                    <span className="statement-stamp">Contradicted</span>
                  ) : (
                    <button className="btn btn-ink statement-press" onClick={() => setPressing(statement)}>
                      Present evidence
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <section id="panel-topics" role="tabpanel" aria-labelledby="tab-topics">
          <p className="panel-intro">Ask as often as you like. Nothing you ask can be missed or used up.</p>
          {exchangePanel}
          <ul className="topic-list">
            {available.map((topic) => {
              const heard = state.topicsHeard.includes(topicKey(suspect.id, topic.id));
              return (
                <li key={topic.id}>
                  <button className={`topic${heard ? ' is-heard' : ''}`} onClick={() => ask(topic.id, topic.label)}>
                    <span className="topic-mark" aria-hidden="true">
                      {heard ? '✓' : '?'}
                    </span>
                    {topic.label}
                    {heard && <span className="visually-hidden"> (already asked)</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="panel-note">New topics may come up as your investigation uncovers more.</p>
        </section>
      )}

      {pressing && (
        <EvidencePicker
          title="Present evidence"
          prompt={`${suspect.name}: “${pressing.text}”`}
          cards={held}
          confirmLabel="Present"
          onPick={present}
          onClose={() => setPressing(null)}
        />
      )}

      {viewing && <EvidenceCard evidence={data.evidence[viewing]} isNew onClose={() => setViewing(null)} />}
    </main>
  );
}
