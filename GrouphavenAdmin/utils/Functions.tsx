import { supabase } from './supabase';
import { format, differenceInYears  } from 'date-fns'
import Sentiment from 'sentiment';

export async function getRemainingRequest(): Promise<{ progress: number; count: number }> {
    if (!supabase) {
        return { progress: 0, count: 0 };
    }

    const { count, error } = await supabase
        .from('verification_request')
        .select('*', { count: 'exact', head: true })
        .eq('request_status', 'pending');

    if (error || count === null || count === undefined) {
        console.error('Error fetching request count:', error);
        return { progress: 0, count: 0 };
    }

    let progress = 0;

    if (count === 0) {
        progress = 100;
    } else if (count < 100) {
        progress = 100 - count;
    }

    return { progress, count };
}

export async function getMatchStatus(): Promise<{ inQueue: number; idle: number }> {
    if (!supabase) {
        return { inQueue: 0, idle: 0 };
    }

    const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    const { count: queueCount, error: queueError } = await supabase
        .from('match_preference')
        .select('*', { count: 'exact', head: true });

    if (
        usersError || queueError ||
        usersCount === null || queueCount === null ||
        usersCount === undefined || queueCount === undefined
    ) {
        console.error('Error fetching counts:', usersError || queueError);
        return { inQueue: 0, idle: 0 };
    }

    const inQueue = queueCount;
    const idle = usersCount - inQueue;

    return { inQueue, idle };
}

export async function getVerificationActivity(): Promise<{ date: string; count: number }[]> {
    if (!supabase) {
        return [];
    }

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
        console.error("User not found or not logged in.");
        return [];
    }

    const userId = user.user.id;
    const today = new Date();
    const results: { date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];

        const { count, error } = await supabase
            .from("verification_request")
            .select("*", { count: "exact", head: true })
            .eq("verification_date", formattedDate)
            .eq("admin_id", userId);

        if (error) {
            console.error(`Error fetching count for ${formattedDate}:`, error);
            results.push({ date: formattedDate, count: 0 });
        } else {
            results.push({ date: formattedDate, count: count || 0 });
        }
    }

    return results;
}

export async function getVerificationStatsPie(requestFrom: Date | null, requestTo: Date | null, verifyFrom: Date | null, verifyTo: Date | null, status: string[]): Promise<[string, number][]> {
    if (!supabase) {
        return [];
    }

    const normalizedStatus = status.map(s => s.toLowerCase());

    let query = supabase
        .from('verification_request')
        .select('request_status');

    if (requestFrom) {
        query = query.gte('request_date', formatDateToLocalYYYYMMDD(requestFrom));
    }

    if (requestTo) {
        query = query.lte('request_date', formatDateToLocalYYYYMMDD(requestTo));
    }

    if (verifyFrom) {
        query = query.gte('verification_date', formatDateToLocalYYYYMMDD(verifyFrom));
    }

    if (verifyTo) {
        query = query.lte('verification_date', formatDateToLocalYYYYMMDD(verifyTo));
    }

    if (normalizedStatus.length > 0) {
        query = query.in('request_status', normalizedStatus);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching verification stats:", error?.message);
        return [];
    }

    // Count occurrences of each status
    const countMap = new Map<string, number>();
    for (const row of data) {
        const key = row.request_status?.toLowerCase() ?? 'unknown';
        countMap.set(key, (countMap.get(key) || 0) + 1);
    }

    const result: [string, number][] = Array.from(countMap.entries());

    return result;
}

export async function getAdminStatsPie(requestFrom: Date | null, requestTo: Date | null, verifyFrom: Date | null, verifyTo: Date | null, status: string[]): Promise<[string, number][]> {
    if (!supabase) {
        return [];
    }

    const normalizedStatus = status.map(s => s.toLowerCase());

    let query = supabase
        .from('verification_request')
        .select('request_status, admin_id (name)');

    // Inside your function
    if (requestFrom) {
        query = query.gte('request_date', formatDateToLocalYYYYMMDD(requestFrom));
    }

    if (requestTo) {
        query = query.lte('request_date', formatDateToLocalYYYYMMDD(requestTo));
    }

    if (verifyFrom) {
        query = query.gte('verification_date', formatDateToLocalYYYYMMDD(verifyFrom));
    }

    if (verifyTo) {
        query = query.lte('verification_date', formatDateToLocalYYYYMMDD(verifyTo));
    }

    if (normalizedStatus.length > 0) {
        query = query.in('request_status', normalizedStatus);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching verification stats:", error?.message);
        return [];
    }

    // Count occurrences by admin name
    const countMap = new Map<string, number>();
    for (const row of data) {
        if (row.request_status?.toLowerCase() === 'pending') {
            continue;
        }

        const name = (row.admin_id as unknown as { name: string } | null)?.name ?? 'Unknown';
        countMap.set(name, (countMap.get(name) || 0) + 1);
    }


    console.log(requestFrom, requestTo, verifyFrom, verifyTo)


    return Array.from(countMap.entries());
}

export async function getVerificationStatsBar(requestFrom: Date | null, requestTo: Date | null, verifyFrom: Date | null, verifyTo: Date | null, status: string[], range: string): Promise<[string, number, number][]> {
    if (!supabase) {
        return [];
    }

    const normalizedStatus = status.map(s => s.toLowerCase());

    let query = supabase
        .from('verification_request')
        .select('verification_date, request_status');

    if (requestFrom) {
        query = query.gte('request_date', formatDateToLocalYYYYMMDD(requestFrom));
    }

    if (requestTo) {
        query = query.lte('request_date', formatDateToLocalYYYYMMDD(requestTo));
    }

    if (verifyFrom) {
        query = query.gte('verification_date', formatDateToLocalYYYYMMDD(verifyFrom));
    }

    if (verifyTo) {
        query = query.lte('verification_date', formatDateToLocalYYYYMMDD(verifyTo));
    }

    if (normalizedStatus.length > 0) {
        query = query.in('request_status', normalizedStatus);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching verification stats:", error?.message);
        return [];
    }

    // Helper to get the formatted date key
    const getDateKey = (dateStr: string): { key: string; raw: Date } => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return { key: 'Invalid', raw: new Date(0) }
        switch (range.toLowerCase()) {
            case 'day':
                return { key: format(date, 'dd-MM-yyyy'), raw: date }
            case 'month':
                return { key: format(date, 'MMM-yyyy'), raw: new Date(date.getFullYear(), date.getMonth(), 1) }
            case 'year':
                return { key: format(date, 'yyyy'), raw: new Date(date.getFullYear(), 0, 1) }
            default:
                return { key: format(date, 'dd-MM-yyyy'), raw: date }
        }
    }
    const statsMap = new Map<string, { approved: number; rejected: number; rawDate: Date }>()

    for (const row of data) {
        const dateStr = row.verification_date
        const status = row.request_status?.toLowerCase()
        if (!dateStr || !status) continue

        if (status === 'pending') continue;

        const { key, raw } = getDateKey(dateStr)

        if (!statsMap.has(key)) {
            statsMap.set(key, { approved: 0, rejected: 0, rawDate: raw })
        }

        const group = statsMap.get(key)!
        if (status === 'approved') {
            group.approved += 1
        } else if (status === 'rejected') {
            group.rejected += 1
        }
    }

    const result: [string, number, number][] = Array.from(statsMap.entries())
        .sort((a, b) => a[1].rawDate.getTime() - b[1].rawDate.getTime())
        .map(([date, { approved, rejected }]) => [date, approved, rejected])

    return result
}

export async function getVerificationRows(requestFrom: Date | null, requestTo: Date | null, verifyFrom: Date | null, verifyTo: Date | null, status: string[]): Promise<[string, string, string, string, string, string, string][]> {
    if (!supabase) {
        return [];
    }

    const normalizedStatus = status.map(s => s.toLowerCase());

    let query = supabase
        .from('verification_request')
        .select(`
  request_id,
  request_status,
  photo_url,
  request_date,
  verification_date,
  users: id (name),
  admin: admin_id (name)
`)


    if (requestFrom) {
        query = query.gte('request_date', formatDateToLocalYYYYMMDD(requestFrom));
    }

    if (requestTo) {
        query = query.lte('request_date', formatDateToLocalYYYYMMDD(requestTo));
    }

    if (verifyFrom) {
        query = query.gte('verification_date', formatDateToLocalYYYYMMDD(verifyFrom));
    }

    if (verifyTo) {
        query = query.lte('verification_date', formatDateToLocalYYYYMMDD(verifyTo));
    }

    if (normalizedStatus.length > 0) {
        query = query.in('request_status', normalizedStatus);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching verification stats:", error?.message);
        return [];
    }

    console.log(data)

    return data.map((item): [string, string, string, string, string, string, string] => [
        item.request_id,
        item.request_status.charAt(0).toUpperCase() + item.request_status.slice(1).toLowerCase(),
        item.photo_url,
        (item.users as unknown as { name: string })?.name || '',
        (item.admin as unknown as { name: string })?.name || '',
        formatDateToDDMMMYYYY(item.request_date),
        formatDateToDDMMMYYYY(item.verification_date),
    ]);
}

function formatDateToLocalYYYYMMDD(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateToDDMMMYYYY(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'dd MMM yyyy'); // e.g., "31 May 2025"
}

export function calculateAge(dob: string): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if the birth month/day hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

export async function getMatchStatsLine(createdFrom: Date | null, createdTo: Date | null, range: string): Promise<[string, number, number][]> {
    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('group')
        .select(`
            group_id,
            date_created,
            user_group:user_group!inner(group_id)
        `)

    if (createdFrom) {
        query = query.gte('date_created', formatDateToLocalYYYYMMDD(createdFrom));
    }

    if (createdTo) {
        query = query.lte('date_created', formatDateToLocalYYYYMMDD(createdTo));
    }


    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching matchmaking stats:", error?.message);
        return [];
    }

    // Helper to get the formatted date key
    const getDateKey = (dateStr: string): { key: string; raw: Date } => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return { key: 'Invalid', raw: new Date(0) }
        switch (range.toLowerCase()) {
            case 'day':
                return { key: format(date, 'dd-MM-yyyy'), raw: date }
            case 'month':
                return { key: format(date, 'MMM-yyyy'), raw: new Date(date.getFullYear(), date.getMonth(), 1) }
            case 'year':
                return { key: format(date, 'yyyy'), raw: new Date(date.getFullYear(), 0, 1) }
            default:
                return { key: format(date, 'dd-MM-yyyy'), raw: date }
        }
    }

    const statsMap = new Map<string, { groupCount: number; userCount: number; rawDate: Date }>();

    for (const row of data) {
        const createdDate = row.date_created;
        const userGroup = row.user_group;
        const userCount = Array.isArray(userGroup) ? userGroup.length : 0;

        const { key, raw } = getDateKey(createdDate);

        if (!statsMap.has(key)) {
            statsMap.set(key, { groupCount: 1, userCount, rawDate: raw });
        } else {
            const current = statsMap.get(key)!;
            current.groupCount += 1;
            current.userCount += userCount;
        }
    }

    // Sort and return as array of [formattedDateKey, count]
    return Array.from(statsMap.entries())
        .sort((a, b) => a[1].rawDate.getTime() - b[1].rawDate.getTime())
        .map(([key, { groupCount, userCount }]) => [key, groupCount, userCount]);

}

export async function getInterestStats(createdFrom: Date | null, createdTo: Date | null): Promise<[string, number][]> {
    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('group')
        .select(`
            interests
        `)

    if (createdFrom) {
        query = query.gte('date_created', formatDateToLocalYYYYMMDD(createdFrom));
    }

    if (createdTo) {
        query = query.lte('date_created', formatDateToLocalYYYYMMDD(createdTo));
    }


    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching interests stats:", error?.message);
        return [];
    }

    // Count interests
    const interestCount: Record<string, number> = {};

    for (const row of data) {
        if (Array.isArray(row.interests)) {
            for (const interest of row.interests) {
                interestCount[interest] = (interestCount[interest] || 0) + 1;
            }
        }
    }

    // Convert to array of [interest, count] and sort descending
    return Object.entries(interestCount).sort((a, b) => b[1] - a[1]);

}

export async function getGroupRows(createdFrom: Date | null, createdTo: Date | null): Promise<[string, string, number, string, string][]> {
    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('group')
        .select(`
            group_id,
            name,
            date_created,
            interests,
            user_group(count)
        `)


    if (createdFrom) {
        query = query.gte('date_created', formatDateToLocalYYYYMMDD(createdFrom));
    }

    if (createdTo) {
        query = query.lte('date_created', formatDateToLocalYYYYMMDD(createdTo));
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error("Error fetching verification stats:", error?.message);
        return [];
    }

    return data.map((item): [string, string, number, string, string] => [
        item.group_id,
        item.name,
        item.user_group?.[0]?.count ?? 0,
        formatDateToDDMMMYYYY(item.date_created),
        (item.interests ?? [])
            .map((interest: string) => interest.charAt(0).toUpperCase() + interest.slice(1).toLowerCase())
            .join(', ')
    ]);
}


export async function getUserGroupMembers(groupId: string): Promise<{ id: string; name: string; image: string }[]> {

    if (!supabase) {
        return [];
    }

  const { data, error } = await supabase
    .from('user_group')
    .select(`
      id,
      users (
        name,
        avatar_url
      )
    `)
    .eq('group_id', groupId);

  if (error || !data) {
    console.error('Error fetching group members:', error?.message);
    return [];
  }

  return data.map((entry: any) => ({
    id: entry.id,
    name: entry.users?.name ?? '(no name)',
    image: entry.users?.avatar_url ?? '',
  }));
}

export async function getReviewRows(createdFrom: Date | null, createdTo: Date | null): Promise<[string, string, string, number, string, string][]> {

    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('reviews')
        .select('*');

    if (createdFrom) {
        query = query.gte('review_date', formatDateToLocalYYYYMMDD(createdFrom));
    }

    if (createdTo) {
        query = query.lte('review_date', formatDateToLocalYYYYMMDD(createdTo));
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching review data:', error);
        return [];
    }

    if (error || !data) {
        console.error("Error fetching verification stats:");
        return [];
    }

    return data.map((item): [string, string, string, number, string, string] => [
        item.review_id,
        item.reviewer_id,
        item.reviewee_id,
        item.rating,
        item.review,
        item.review_date
    ]);
}

export async function getReviewStatsPie(createdFrom: Date | null, createdTo: Date | null): Promise<{ rating: number, count: number }[]> {

    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('reviews')
        .select('rating');

    if (createdFrom) {
        query = query.gte('review_date', formatDateToLocalYYYYMMDD(createdFrom));
    }

    if (createdTo) {
        query = query.lte('review_date', formatDateToLocalYYYYMMDD(createdTo));
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching ratings:', error);
        return [];
    }

    if (!data) {
        return [];
    }

    // Count occurrences of each rating
    const ratingCounts: { [key: number]: number } = {};

    for (const item of data) {
    const rating = item.rating;
        if (typeof rating === 'number') {
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        }
    }

    // Convert the count object to array of { rating, count }
    return Object.entries(ratingCounts).map(([rating, count]) => ({
    rating: parseInt(rating),
    count
    }));
}

export function getSentimentLabel(text: string): 'Positive' | 'Neutral' | 'Negative' {
    const result = new Sentiment().analyze(text);
    const score = result.score;

    if (score > 1) return 'Positive';
    if (score < -1) return 'Negative';
    return 'Neutral';
}

export async function getReviewSentimentStatsPie(createdFrom: Date | null, createdTo: Date | null): Promise<{ sentiment: string, count: number }[]> {

    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('reviews')
        .select('review');

    if (createdFrom) {
        query = query.gte('review_date', formatDateToLocalYYYYMMDD(createdFrom));
    }
    if (createdTo) {
        query = query.lte('review_date', formatDateToLocalYYYYMMDD(createdTo));
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const sentimentCounter: { [key: string]: number } = {
        Positive: 0,
        Neutral: 0,
        Negative: 0
    };

    for (const item of data) {
        const result = new Sentiment().analyze(item.review);
        const score = result.score;
        const label = score > 1 ? 'Positive' : score < -1 ? 'Negative' : 'Neutral';
        sentimentCounter[label]++;
    }

    return Object.entries(sentimentCounter).map(([sentiment, count]) => ({
    sentiment,
    count
}));
}

export async function getSentimentRatingMismatch( createdFrom: Date | null, createdTo: Date | null ): Promise<{ review_id: string, rating: number, sentiment: string, review: string }[]> {
  
  if (!supabase) return [];

  let query = supabase
    .from('reviews')
    .select('review_id, rating, review');

  if (createdFrom) {
    query = query.gte('review_date', formatDateToLocalYYYYMMDD(createdFrom));
  }
  if (createdTo) {
    query = query.lte('review_date', formatDateToLocalYYYYMMDD(createdTo));
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const mismatches: { review_id: string, rating: number, sentiment: string, review: string }[] = [];

  for (const item of data) {
    if (!item.review || item.review.trim() === '') continue;

    const result = new Sentiment().analyze(item.review);
    const score = result.score;
    const sentiment = score >= 1 ? 'Positive' : score <= -1 ? 'Negative' : 'Neutral';
    const rating = item.rating;

    console.log({
        review_id: item.review_id,
        review: item.review,
        rating,
        score,
        sentiment,
        mismatch:
            (sentiment === 'Positive' && rating <= 2) ||
            (sentiment === 'Negative' && rating >= 4) ||
            (sentiment === 'Neutral' && (rating <= 1 || rating >= 5)),
    });

    const isMismatch =
      (sentiment === 'Positive' && rating <= 2) ||
      (sentiment === 'Negative' && rating >= 4) ||
      (sentiment === 'Neutral' && (rating <= 1 || rating >= 5));

    if (isMismatch) {
      mismatches.push({
        review_id: item.review_id,
        rating,
        sentiment,
        review: item.review,
      });
    }
  }

  console.log('Sentiment mismatches:', mismatches.length);
  return mismatches;
}


export async function getReviewStatsLine( createdFrom: Date | null, createdTo: Date | null ): Promise<{ date: string, avgRating: number }[]> {
  if (!supabase) return [];

  let query = supabase
    .from('reviews')
    .select('review_date, rating');

  if (createdFrom) {
    query = query.gte('review_date', formatDateToLocalYYYYMMDD(createdFrom));
  }

  if (createdTo) {
    query = query.lte('review_date', formatDateToLocalYYYYMMDD(createdTo));
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching line chart review data:', error);
    return [];
  }

  const dateGroups: { [date: string]: number[] } = {};

  for (const item of data) {
    const date = format(new Date(item.review_date), 'yyyy-MM-dd');
    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(item.rating);
  }

  return Object.entries(dateGroups)
    .sort(([a], [b]) => (a < b ? -1 : 1)) // sort chronologically
    .map(([date, ratings]) => {
      const sum = ratings.reduce((acc, val) => acc + val, 0);
      const avgRating = parseFloat((sum / ratings.length).toFixed(2));
      return { date, avgRating };
    });
}


export async function getReportRows( createdFrom: Date | null, createdTo: Date | null, statuses?: string[] ): Promise<{ report_id: string; reported_by: string; reported_user: string; reason: string; screenshot_url: string | null; screenshot_url2: string | null; screenshot_url3: string | null; report_date: string; status: string; }[]> {
  if (!supabase) return [];

  let query = supabase
    .from('reports')
    .select('*');

  if (createdFrom) {
    query = query.gte('report_date', formatDateToLocalYYYYMMDD(createdFrom));
  }

  if (createdTo) {
    query = query.lte('report_date', formatDateToLocalYYYYMMDD(createdTo));
  }

  if (Array.isArray(statuses) && statuses.length > 0) {
    query = query.in('status', statuses.map(s => s.toUpperCase()));
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching report data:', error);
    return [];
  }

  return data;
}

export async function getReportStatusStatsPie( createdFrom: Date | null, createdTo: Date | null ): Promise<{ status: string; count: number }[]> {
  if (!supabase) return [];

  let query = supabase
    .from('reports')
    .select('status');

  if (createdFrom) {
    query = query.gte('report_date', formatDateToLocalYYYYMMDD(createdFrom));
  }

  if (createdTo) {
    query = query.lte('report_date', formatDateToLocalYYYYMMDD(createdTo));
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching report status stats:', error);
    return [];
  }

  const statusCounts: { [status: string]: number } = {};

  for (const item of data) {
    const status = item.status?.toUpperCase();
    if (status) {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  }

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));
}

export async function getUserRow(filters?: {
  id?: string;
  name?: string;
  status?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  minExp?: number;
  maxExp?: number;
  minRating?: number;
  maxRating?: number;
}): Promise<
  {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    dob: string | null;
    gender: string | null;
    city: string | null;
    photo_1: string | null;
    photo_2: string | null;
    photo_3: string | null;
    photo_4: string | null;
    photo_5: string | null;
    photo_6: string | null;
    is_verified: boolean;
    tagline: string | null;
    is_trusted: boolean;
    exp: number;
    avg_rating: number;
    status: string;
  }[]
> {
  if (!supabase) return [];

  let query = supabase
    .from('users')
    .select(`
      id,
      name,
      avatar_url,
      bio,
      dob,
      gender,
      city,
      photo_1,
      photo_2,
      photo_3,
      photo_4,
      photo_5,
      photo_6,
      is_verified,
      tagline,
      is_trusted,
      exp,
      avg_rating,
      status
    `);

  if (filters?.id) query = query.eq('id', filters.id);
  if (filters?.name) query = query.ilike('name', `%${filters.name}%`);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.gender) query = query.eq('gender', filters.gender);

  if (filters?.minExp !== undefined) query = query.gte('exp', filters.minExp);
  if (filters?.maxExp !== undefined) query = query.lte('exp', filters.maxExp);

  if (filters?.minRating !== undefined) query = query.gte('avg_rating', filters.minRating);
  if (filters?.maxRating !== undefined) query = query.lte('avg_rating', filters.maxRating);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user data:', error);
    return [];
  }

  if (!data) return [];

  // Filter by age range (calculated from dob)
  const filtered = data.filter((user) => {
    if (!user.dob) return false;

    const age = differenceInYears(new Date(), new Date(user.dob));

    if (filters?.minAge !== undefined && age < filters.minAge) return false;
    if (filters?.maxAge !== undefined && age > filters.maxAge) return false;

    return true;
  });

  return filtered;
}


