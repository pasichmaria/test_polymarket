import { EventDetailContent } from '@/app/content/EventDetailContent';
import { fetchEventBySlugServer } from '@/lib/fetch-event';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await fetchEventBySlugServer(slug);
  if (!event) {
    notFound();
  }
  return <EventDetailContent event={event} />;
}
