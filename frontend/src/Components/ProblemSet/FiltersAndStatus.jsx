import React from 'react'

const FiltersAndStatus = ({TAGS , DIFFICULTIES , toTitleCase , setActiveTag , activeTag , setDifficulty , difficulty , STATUSES , setStatus , loading , error , filtered , total , renderTableBody , status , diffColor }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Tag strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-[5px] rounded-[20px] text-[12px] whitespace-nowrap transition-all ${
                  activeTag === tag 
                    ? 'bg-[#ffa116]/20 text-[#ffa116] font-medium'
                    : 'bg-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-1 bg-[#1a1a1a] rounded-[8px] p-1">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-[4px] rounded-[6px] text-[12px] transition-all ${
                    difficulty === d
                      ? d === 'All' ? 'bg-[#333] text-white' : `bg-[#333] ${diffColor(d)}`
                      : 'text-[#6b6b6b] hover:text-[#e8e8e8]'
                  }`}
                >
                  {toTitleCase(d)}
                </button>
              ))}
            </div>

            <div className="flex gap-1 bg-[#1a1a1a] rounded-[8px] p-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-[4px] rounded-[6px] text-[12px] transition-all ${
                    status === s ? 'bg-[#333] text-white' : 'text-[#6b6b6b] hover:text-[#e8e8e8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {!loading && !error && (
              <span className="ml-auto text-[12px] text-[#6b6b6b]">
                {filtered.length} / {total} problems
              </span>
            )}
          </div>

          {/* Problems table */}
          <div className="rounded-[10px] overflow-hidden border border-[#2a2a2a]">
            <div className="grid grid-cols-[32px_1fr_100px_90px_70px] gap-0 bg-[#1a1a1a] px-4 py-2 border-b border-[#2a2a2a]">
              <span className="text-[11px] text-[#6b6b6b]">#</span>
              <span className="text-[11px] text-[#6b6b6b]">Title</span>
              <span className="text-[11px] text-[#6b6b6b] text-center">Acceptance</span>
              <span className="text-[11px] text-[#6b6b6b] text-center">Difficulty</span>
              <span className="text-[11px] text-[#6b6b6b] text-center">Status</span>
            </div>
            {renderTableBody()}
          </div>
        </div>
  )
}

export default FiltersAndStatus