import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AinoPanel from '../features/assistant/AinoPanel';
import { renderView } from '../routes';

export default function Shell() {
  const { role, view, lang } = useApp();
  const key = role + '/' + view;
  return (
    <>
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content" key={key + lang}>{renderView(role, view)}</div>
      </main>
      <AinoPanel />
    </>
  );
}
