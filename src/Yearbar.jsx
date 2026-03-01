export default function Yearbar({sortedYears,handleButton,buttonIndex}){
    return(
<div className="w-full bg-[#fff0f6] border-y border-[#ffb6d9] py-3">
  <div className="w-full flex flex-row justify-center gap-3 overflow-x-auto px-4">
    {sortedYears.map((btn, index) => {
      const active = index === buttonIndex;
      return (
        <button
          key={index}
          onClick={() => handleButton(btn, index)}
          className={`shrink-0 font-g font-bold px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            active
              ? "bg-[#ffb6d9] text-white"
              : "bg-white text-[#E75480] border border-[#ffb6d9] hover:bg-[#ffe3ef]"
          }`}
        >
          {btn}
        </button>
      );
    })}
  </div>
</div>
        //this is map the years onto the page which an index which will be set to set default colour
    )
}