import React from 'react';

interface Props {
  title: string;
}

const PlaceholderPage: React.FC<Props> = ({ title }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
          {title.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          This section is set up in the sidebar. Content for {title} will be added here soon.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
