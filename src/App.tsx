import { ashgrove } from './case/ashgrove';
import GameHeader from './components/GameHeader';
import Toasts from './components/Toasts';
import { GameProvider, useGame } from './game/GameContext';
import { formatSavedAt } from './game/save';
import AccuseScreen from './screens/AccuseScreen';
import CaseFileScreen from './screens/CaseFileScreen';
import EndingScreen from './screens/EndingScreen';
import InterviewScreen from './screens/InterviewScreen';
import IntroScreen from './screens/IntroScreen';
import LocationScreen from './screens/LocationScreen';
import RoomsScreen from './screens/RoomsScreen';
import SuspectsScreen from './screens/SuspectsScreen';
import TitleScreen from './screens/TitleScreen';

export default function App() {
  return (
    <GameProvider data={ashgrove}>
      <Screens />
      <Toasts />
    </GameProvider>
  );
}

function Screens() {
  const { data, view, go, saveInfo, canContinue, continueSolved, continueGame, startNewGame } = useGame();

  switch (view.name) {
    case 'title':
      return (
        <TitleScreen
          mode={!canContinue ? 'fresh' : continueSolved ? 'solved' : 'inProgress'}
          savedLabel={saveInfo.status === 'valid' && saveInfo.savedAt ? formatSavedAt(saveInfo.savedAt) : undefined}
          unreadableSave={saveInfo.status === 'unreadable'}
          onContinue={continueGame}
          onNewGame={startNewGame}
        />
      );
    case 'intro':
      return (
        <IntroScreen
          paragraphs={data.story.intro}
          onContinue={() => go({ name: 'location', id: 'dining' })}
          onBack={() => go({ name: 'title' })}
        />
      );
    case 'ending':
      return <EndingScreen />;
    default:
      return (
        <>
          <GameHeader />
          {view.name === 'rooms' && <RoomsScreen />}
          {view.name === 'location' && <LocationScreen key={view.id} locationId={view.id} />}
          {view.name === 'suspects' && <SuspectsScreen />}
          {view.name === 'interview' && <InterviewScreen key={view.id} suspectId={view.id} />}
          {view.name === 'casefile' && <CaseFileScreen />}
          {view.name === 'accuse' && <AccuseScreen />}
        </>
      );
  }
}
