import React from 'react'

const StatPill = ({ label, count, color }) => (
    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-[8px] bg-[#111111]">
        <span className={`text-[22px] font-semibold ${color}`}>{count}</span>
        <span className="text-[11px] text-[#6b6b6b] mt-[2px]">{label}</span>
    </div>
)

const YourProgress = ({ problems, solved, total, diffColor, attempted }) => {
    console.log("problems", problems)
    return (
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">

            <div className="bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-4">
                <h3 className="text-[13px] font-medium text-[#e8e8e8] mb-3">Your Progress</h3>
                <div className="flex gap-2 justify-between mb-4">

                    <StatPill label="Easy" count={problems.filter(p => p.difficulty?.toUpperCase() === 'EASY' && p.status === 'Solved').length} color="text-[#00b8a3]" />
                    <StatPill label="Medium" count={problems.filter(p => p.difficulty?.toUpperCase() === 'MEDIUM' && p.status === 'Solved').length} color="text-[#ffc01e]" />
                    <StatPill label="Hard" count={problems.filter(p => p.difficulty?.toUpperCase() === 'HARD' && p.status === 'Solved').length} color="text-[#ff375f]" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-[#6b6b6b]">
                        <span>{solved} solved</span>
                        <span>of {total}</span>
                    </div>
                    <div className="h-[6px] rounded-full bg-[#2a2a2a] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#ffa116] transition-all duration-700"
                            style={{ width: total ? `${(solved / total) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-4">
                <h3 className="text-[13px] font-medium text-[#e8e8e8] mb-3">Overview</h3>
                {[
                    { label: 'Total solved', value: solved, color: 'text-[#e8e8e8]' },
                    { label: 'Attempted', value: attempted, color: 'text-[#ffc01e]' },
                    { label: 'Completion', value: total ? `${Math.round((solved / total) * 100)}%` : '0%', color: 'text-[#ffa116]' },
                ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#2a2a2a] last:border-0">
                        <span className="text-[12px] text-[#6b6b6b]">{item.label}</span>
                        <span className={`text-[13px] font-medium ${item.color}`}>{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="bg-[#1a1a1a] rounded-[10px] border border-[#2a2a2a] p-4">
                <h3 className="text-[13px] font-medium text-[#e8e8e8] mb-3">Difficulty</h3>
                {['EASY', 'MEDIUM', 'HARD'].map(d => {
                    const total_d = problems.filter(p => p.difficulty === d).length
                    const solved_d = problems.filter(p => p.difficulty === d && p.status === 'Solved').length
                    const label = d.charAt(0) + d.slice(1).toLowerCase() // "Easy", "Medium", "Hard"
                    return (
                        <div key={d} className="mb-3 last:mb-0">
                            <div className="flex justify-between text-[11px] mb-1">
                                <span className={diffColor(d)}>{label}</span>
                                <span className="text-[#6b6b6b]">{solved_d}/{total_d}</span>
                            </div>
                            <div className="h-[4px] rounded-full bg-[#2a2a2a] overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${d === 'EASY' ? 'bg-[#00b8a3]' : d === 'MEDIUM' ? 'bg-[#ffc01e]' : 'bg-[#ff375f]'
                                        }`}
                                    style={{ width: total_d ? `${(solved_d / total_d) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default YourProgress