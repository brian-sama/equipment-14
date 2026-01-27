import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export const handler: Handler = async (event, context) => {
    // Get serial number from the path (assuming redirect handles the routing)
    // The path will be something like /api/external/repair-status/12345
    const pathParts = event.path.split('/');
    const serialNumber = pathParts[pathParts.length - 1];

    if (!serialNumber) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Serial number is required' }),
        };
    }

    try {
        const { data, error } = await supabase
            .from('equipment')
            .select('job_card_no, status, created_at, sr_number')
            .eq('serial_number', serialNumber)
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Supabase error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Internal server error' }),
            };
        }

        if (!data) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Equipment not found' }),
            };
        }

        const inRepair = data.status !== 'Fixed' && data.status !== 'Collected';

        return {
            statusCode: 200,
            body: JSON.stringify({
                jobId: data.job_card_no,
                status: data.status,
                inRepair: inRepair,
                srNumber: data.sr_number,
                receivedDate: data.created_at
            }),
        };

    } catch (err) {
        console.error('Function error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
