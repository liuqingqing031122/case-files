import { useState } from 'react';
import TitleScreen from './screens/TitleScreen';
import IntroScreen from './screens/IntroScreen';
import DiningRoomScreen from './screens/DiningRoomScreen';

// M1 prototype: plain useState for navigation. The real game state
// (reducer + save) arrives in M2.
type Screen = 'title' | 'intro' | 'dining';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [found, setFound] = useState<string[]>([]);

  const addToCaseFile = (id: string) =>
    setFound((prev) => (prev.includes(id) ? prev : [...prev, id]));

  switch (screen) {
    case 'title':
      return <TitleScreen onEnter={() => setScreen('intro')} />;
    case 'intro':
      return <IntroScreen onContinue={() => setScreen('dining')} onBack={() => setScreen('title')} />;
    case 'dining':
      return (
        <DiningRoomScreen
          found={found}
          onFind={addToCaseFile}
          onExit={() => setScreen('title')}
        />
      );
  }
}
