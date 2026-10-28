import { llmsIndex } from '@/lib/source';

export async function loader() {
  return new Response(await llmsIndex());
}
