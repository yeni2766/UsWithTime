export default function OpenFormButton({setIsOpen, isOpen}){
    return(
        <button className={`fixed right-10 bottom-10 w-16 h-16 bg-white text-[#4a154b] font-display text-2xl rounded-full border-2 border-black hover:translate-y-1 hover:shadow-[0_3px_0_#e8dde2] active:translate-y-2 transition-all duration-200 cursor-pointer  ${isOpen ? 'hidden' : 'block'}`} aria-label="Add new memory" onClick={()=>setIsOpen(prev => !prev)}>+</button>
    )
}