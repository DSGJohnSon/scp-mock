import Link from "next/link";

export default function TopBar() {
  return (
    <>
      <Link
        href={"/reserver"}
        title={"Réserver un stage"}
        className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center justify-center lg:block lg:p-2 px-4 absolute left-0 top-0 z-[60]"
      >
        <div className="text-xs md:text-sm text-slate-50 flex items-center justify-center gap-2">
          <span>
            <span className="font-semibold mr-1">
              {"Promotions en cours avant la haute saison !"}
            </span>
            {"Profitez-en dès maintenant"}
          </span>
        </div>
      </Link>
    </>
  );
}
