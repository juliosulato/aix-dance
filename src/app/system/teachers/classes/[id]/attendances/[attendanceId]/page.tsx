import AttendanceView from "./attendance";

export default async function AttendancePage({ params }: { params: Promise<{ attendanceId: string }>}) {
    const { attendanceId } = await params;

    return <AttendanceView attendanceId={attendanceId} />;
}