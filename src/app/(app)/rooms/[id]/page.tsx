import RoomDetailsPage from "@/modules/rooms/pages/RoomDetailsPage";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomDetailsPage roomId={id} />;
}
