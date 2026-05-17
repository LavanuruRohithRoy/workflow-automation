export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome to the AI-Powered Workflow Automation System.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Total Logs Processed</h3>
          <p className="text-3xl font-bold mt-2 text-indigo-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Pending Review</h3>
          <p className="text-3xl font-bold mt-2 text-amber-500">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Success Rate</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-500">100%</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity Placeholder</h2>
        <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400">
          Charts and Data will go here
        </div>
      </div>
    </div>
  );
}
