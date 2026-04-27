export const SolutionsPanel = ({ problem }) => (
  <div className="p-5 overflow-y-auto h-full">
    <h3 className="text-[14px] font-medium text-[#e8e8e8] mb-4">Editorial</h3>
    {problem.editorial
      ? <p className="text-[13px] text-[#c8c8c8] leading-relaxed">{problem.editorial}</p>
      : <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#6b6b6b]"><span className="text-[13px]">No editorial yet</span></div>
    }
  </div>
)