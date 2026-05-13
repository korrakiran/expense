'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function SpendingChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="mt-5 h-40 rounded-3xl bg-[#f5f5f6] px-4 py-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={18}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} dy={8} />
          <YAxis hide />
          <Bar dataKey="value" fill="#0b0b0b" radius={[12, 12, 12, 12]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
