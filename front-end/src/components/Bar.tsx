export const Bar2 = ({ pct, kind }: any) => <div className="bar"><div className={'bar-fill' + (kind ? ' ' + kind : '')} style={{ width: pct + '%' }} /></div>;
