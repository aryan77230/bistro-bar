import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./env', () => ({
  loadEnv: () => ({
    GHL_LOCATION_ID: 'loc_123',
    GHL_PIT: 'pit_xyz',
    GHL_PIPELINE_ID: 'pipe_1',
    GHL_STAGE_BOOKED: 'stage_booked',
    GHL_STAGE_SEATED: 'stage_seated',
    GHL_STAGE_COMPLETED: 'stage_completed',
    GHL_STAGE_CANCELLED: 'stage_cancel',
    GHL_STAGE_NOSHOW: 'stage_noshow',
    GHL_FIELD_LAST_BOOKING_DATE: 'fld_date',
    GHL_FIELD_BOOKING_TIME: 'fld_time',
    GHL_FIELD_LAST_PARTY_SIZE: 'fld_party',
    GHL_FIELD_TOTAL_VISITS: 'fld_visits',
    GHL_FIELD_CANCEL_LINK: 'fld_cancel',
    GHL_FIELD_SPECIAL_REQUESTS: 'fld_notes',
    GHL_FIELD_TABLE_LABEL: 'fld_table',
    SUPABASE_URL: 'https://x.supabase.co',
    SUPABASE_ANON_KEY: 'a',
    SUPABASE_SERVICE_ROLE_KEY: 'b',
    PUBLIC_SITE_URL: 'https://example.com',
  }),
}));

beforeEach(() => {
  global.fetch = vi.fn() as typeof fetch;
});

describe('upsertContact', () => {
  it('sends correct headers and body', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ contact: { id: 'c_999' } }), { status: 200 })
    );
    const { upsertContact } = await import('./ghl');
    const id = await upsertContact({ firstName: 'Alice', email: 'a@b.com', phone: '+91', tags: ['t1'] });
    expect(id).toBe('c_999');

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][0]).toBe('https://services.leadconnectorhq.com/contacts/upsert');
    const opts = calls[0][1];
    expect(opts.headers.Authorization).toBe('Bearer pit_xyz');
    expect(opts.headers.Version).toBe('2021-07-28');
    const body = JSON.parse(opts.body);
    expect(body.locationId).toBe('loc_123');
    expect(body.tags).toEqual(['t1']);
  });

  it('throws on non-2xx', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ msg: 'bad' }), { status: 400 })
    );
    const { upsertContact } = await import('./ghl');
    await expect(upsertContact({ firstName: 'A', phone: '+1' })).rejects.toThrow(/upsert failed/);
  });
});

describe('addTags', () => {
  it('POSTs to right URL', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const { addTags } = await import('./ghl');
    await addTags('c_999', ['t1', 't2']);
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('https://services.leadconnectorhq.com/contacts/c_999/tags');
    expect(JSON.parse(opts.body)).toEqual({ tags: ['t1', 't2'] });
  });
});

describe('updateContactFields', () => {
  it('builds customFields array correctly', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const { updateContactFields } = await import('./ghl');
    await updateContactFields('c_999', { lastBookingDate: '2026-05-01', bookingTime: '6:30 PM', lastPartySize: 4 });
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.customFields).toEqual(expect.arrayContaining([
      { id: 'fld_date',  value: '2026-05-01' },
      { id: 'fld_time',  value: '6:30 PM' },
      { id: 'fld_party', value: 4 },
    ]));
  });
});

describe('createOpportunity', () => {
  it('returns new id', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ opportunity: { id: 'opp_42' } }), { status: 200 })
    );
    const { createOpportunity } = await import('./ghl');
    const id = await createOpportunity({ contactId: 'c', name: 'X', monetaryValue: 6000 });
    expect(id).toBe('opp_42');
  });
});
