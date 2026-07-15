import Dashboard from './features/dashboard/Dashboard';
import Participants from './features/participants/List';
import Bootcamps from './features/measures/List';
import Trainers from './features/trainers/Trainers';
import Attendance from './features/attendance/Sessions';
import QM from './features/qm/QM';
import Audit from './features/audit/Audit';
import Content from './features/content/Content';
import Docs from './features/documents/DocumentModel';
import Alumni from './features/alumni/Alumni';
import Comms from './features/comms/Comms';
import Automations from './features/automations/Automations';
import SupportView from './features/support/Support';
import AdminSupport from './features/support/AdminSupport';
import UserSupport from './features/support/UserSupport';
import SettingsView from './features/settings/Settings';
import TrHome from './features/portals/trainer/Home';
import TrAssignment from './features/portals/trainer/Assignment';
import TrGrade from './features/portals/trainer/Grading';
import TrFile from './features/portals/trainer/TrainerFile';
import PaHome from './features/portals/participant/Schedule';
import PaLearn from './features/portals/participant/Learn';
import PaProgress from './features/portals/participant/Progress';
import PaDocs from './features/portals/participant/Documents';
import PaCerts from './features/portals/participant/Certificates';



export function renderView(role: string, view: string) {
  switch (role + '/' + view) {
    case 'verwaltung/home': return <Dashboard />;
    case 'verwaltung/participants': return <Participants />;
    case 'verwaltung/measures': return <Bootcamps />;
    case 'verwaltung/trainers': return <Trainers />;
    case 'verwaltung/attendance': return <Attendance />;
    case 'verwaltung/qm': return <QM />;
    case 'verwaltung/audit': return <Audit />;
    case 'verwaltung/content': return <Content />;
    case 'verwaltung/docs': return <Docs />;
    case 'verwaltung/alumni': return <Alumni />;
    case 'verwaltung/comms': return <Comms />;
    case 'verwaltung/automations': return <Automations />;
    case 'dozent/home': return <TrHome />;
    case 'dozent/attendance': return <Attendance />;
    case 'dozent/assignment': return <TrAssignment />;
    case 'dozent/grade': return <TrGrade />;
    case 'dozent/file': return <TrFile />;
    case 'teilnehmer/home': return <PaHome />;
    case 'teilnehmer/learn': return <PaLearn />;
    case 'teilnehmer/progress': return <PaProgress />;
    case 'teilnehmer/docs': return <PaDocs />;
    case 'teilnehmer/certs': return <PaCerts />;
    
    case 'verwaltung/support': return <AdminSupport />;
    case 'dozent/support':     return <UserSupport role="trainer" />;
    case 'teilnehmer/support': return <UserSupport role="participant" />;
    case 'verwaltung/settings':
    case 'dozent/settings':
    case 'teilnehmer/settings': return <SettingsView />;
    case 'verwaltung/support': return <AdminSupport />;
    case 'dozent/support':     return <UserSupport role="trainer" />;
    case 'teilnehmer/support': return <UserSupport role="participant" />;

    default: return null;
  }
}