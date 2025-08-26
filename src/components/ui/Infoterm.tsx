type Props = {
    label: string;
    value?: string | number | null;
}
export default function InfoTerm({ label, value }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-black text-base font-medium">{label}</h3>
            <h4 className="text-base text-neutral-500 font-normal">{value || "-"}</h4>
        </div>
    )
}