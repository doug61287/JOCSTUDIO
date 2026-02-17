import { ChatInterface } from './components/ChatInterface';

const mockProject = {
  id: '1',
  name: 'Bellevue Hospital Renovation',
  description: '15th Floor Cardiology Wing',
  documentCount: 12,
};

function App() {
  return <ChatInterface project={mockProject} />;
}

export default App;
