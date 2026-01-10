import RoutineBuilderPage from "../../../../modules/routines/pages/RoutineBuilderPage";

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoutineBuilderPage routineId={id} />;
}
