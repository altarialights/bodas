export type Phase = 'before' | 'during' | 'after';
export type Section = 'story' | 'program' | 'guide' | 'participation' | 'gifts' | 'faq';
export type Attendance = 'pending' | 'yes' | 'no';
export interface Company { id: string; name: string; contactLabel: string; contactUrl?: string }
export interface Scoped { id: string; companyId: string; weddingId: string }
export interface VisualConfig { accent: string; accentDark: string; paper: string; monogram: string; photoTreatment: 'warm-mono' | 'natural'; layout: 'editorial' }
export interface MediaResource extends Scoped { kind: 'image' | 'audio' | 'video'; src: string; alt: string; width?: number; height?: number; poster?: string; origin: string; license: string }
export interface Venue extends Scoped { name: string; region: string; description: string; arrival: string; parking: string; mapsUrl?: string; fictional: boolean }
export interface ProgramEvent extends Scoped { startsAt: string; title: string; description: string; venueId: string }
export interface Transport extends Scoped { direction: 'outbound' | 'return'; label: string; time: string; departure: string; capacity: number }
export interface Accommodation extends Scoped { name: string; description: string; note: string; url?: string }
export interface FAQ extends Scoped { question: string; answer: string }
export interface Gift extends Scoped { title: string; description: string; kind: 'list' | 'honeymoon'; url?: string }
export interface SongProposal extends Scoped { invitationId: string; title: string; artist: string; memory: string }
export interface Memory extends Scoped { invitationId: string; author: string; text: string; kind: 'guestbook' | 'anniversary'; status: 'sealed' | 'published'; releaseAt?: string }
export interface Guest extends Scoped { invitationId: string; name: string; child: boolean; optional: boolean; table?: string }
export interface Invitation extends Scoped { opaqueToken: string; greeting: string; guestIds: string[]; allowCompanion: boolean; companionGuestId?: string; tablePublished: boolean }
export interface IndividualResponse extends Scoped { invitationId: string; guestId: string; attendance: Attendance; menuId?: string; allergies?: string; arrival?: string; outboundId?: string; returnId?: string; accessibility?: string; comment?: string }
export interface MenuOption { id: string; label: string; childOnly: boolean }
export interface StoryMoment { year: string; title: string; text: string; mediaId: string }
export interface Wedding {
  id: string; companyId: string; slug: string; names: [string, string]; locale: string; timezone: string;
  startsAt: string; endsAt: string; rsvpDeadline: string; phase: Phase | 'auto';
  visual: VisualConfig; heroId: string; detailId: string; venueImageId: string; musicId?: string; messageMediaId?: string;
  sections: Record<Section, boolean>; headline: [string, string]; dedication: string; welcome: string; story: StoryMoment[];
  dressCode: string; dressNote: string; accessibility: string; rainPlan: string; contact: string; contactUrl?: string;
  thankYou: string; giftMessage: string; notices: string[]; menuOptions: MenuOption[]; demoInvitationToken: string;
}
export interface WeddingBundle { wedding: Wedding; company: Company; media: MediaResource[]; venues: Venue[]; program: ProgramEvent[]; transport: Transport[]; accommodations: Accommodation[]; faqs: FAQ[]; gifts: Gift[] }
export interface InvitationContext { invitation: Invitation; guests: Guest[] }
export interface ManagementData { invitations: Invitation[]; guests: Guest[]; responses: IndividualResponse[] }
export interface ResponseReceipt { id: string; savedAt: string; simulated: true }
export interface WeddingRepository {
  listWeddings(): Promise<Wedding[]>;
  getWedding(slug: string): Promise<WeddingBundle | undefined>;
  resolveInvitation(opaqueToken: string, weddingId: string): Promise<InvitationContext | undefined>;
  getResponses(weddingId: string, invitationId: string): Promise<IndividualResponse[]>;
  saveResponses(context: InvitationContext, responses: IndividualResponse[]): Promise<ResponseReceipt>;
  getProgram(weddingId: string): Promise<ProgramEvent[]>;
  getTransport(weddingId: string): Promise<Transport[]>;
  proposeSong(proposal: SongProposal): Promise<void>;
  saveMemory(memory: Memory): Promise<void>;
  getMemories(weddingId: string, invitationId?: string): Promise<Memory[]>;
  saveMediaMetadata(media: MediaResource): Promise<void>;
  getManagement(weddingId: string): Promise<ManagementData>;
  updateWedding(wedding: Wedding): Promise<void>;
}
