import Portrait from '../components/Portrait';
import { useGame } from '../game/GameContext';
import { INTERVIEW_STATUS_LABELS, interviewStatus } from '../game/interviewStatus';
import { SUSPECT_INFO } from '../game/uiContent';
import './SuspectsScreen.css';

export default function SuspectsScreen() {
  const { data, state, go } = useGame();

  return (
    <main className="page">
      <p className="page-kicker">The household</p>
      <h1 className="page-title">Suspects</h1>
      <p className="page-intro">
        Hear each account, then press any statement you can disprove by presenting evidence.
      </p>

      <ul className="suspect-grid">
        {data.suspects.map((suspect) => {
          const lies = suspect.statements.filter((s) => s.contradiction);
          const caught = lies.filter((s) => state.contradictions.includes(s.contradiction!.id)).length;
          const status = INTERVIEW_STATUS_LABELS[interviewStatus(suspect, state)];
          return (
            <li key={suspect.id}>
              <button className="suspect-card" onClick={() => go({ name: 'interview', id: suspect.id })}>
                <Portrait suspectId={suspect.id} size={84} />
                <span className="suspect-card-body">
                  <span className="suspect-card-name">{suspect.name}</span>
                  <span className="suspect-card-role">{SUSPECT_INFO[suspect.id]?.role}</span>
                  <span className="suspect-card-status">
                    {status}
                    {caught > 0 && ` · ${caught} lie${caught > 1 ? 's' : ''} exposed`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
