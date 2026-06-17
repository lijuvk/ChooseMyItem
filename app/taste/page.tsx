import WelcomeScreen from './_welcome';

export default async function TastePage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const params = await searchParams;
  return <WelcomeScreen tableId={params.table ?? null} />;
}
