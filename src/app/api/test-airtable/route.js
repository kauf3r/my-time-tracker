import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    console.log('=== AIRTABLE CONNECTION TEST ===');
    
    // Check environment variables
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Time_Entries';
    
    console.log('Environment check:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      tokenPrefix: accessToken?.substring(0, 10) + '...',
      tokenSuffix: '...' + accessToken?.substring(accessToken.length - 10),
      baseId: baseId,
      baseIdLength: baseId?.length,
      baseIdPrefix: baseId?.substring(0, 10),
      tableName: tableName
    });
    
    if (!accessToken || !baseId) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          hasAccessToken: !!accessToken,
          hasBaseId: !!baseId
        }
      }, { status: 400 });
    }
    
    // Initialize Airtable
    console.log('Initializing Airtable...');
    const airtable = new Airtable({ apiKey: accessToken });
    const base = airtable.base(baseId);
    const table = base(tableName);
    
    // Test 1: Try to list tables/bases (this tests token permissions)
    console.log('Testing basic connectivity...');
    
    // Test 2: Try to read records (minimal request)
    console.log('Testing record read...');
    const records = await table.select({
      maxRecords: 1
    }).firstPage();
    
    console.log('Success! Found records:', records.length);
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful',
      recordCount: records.length,
      environment: {
        baseId: baseId,
        tableName: tableName,
        hasAccessToken: !!accessToken,
        tokenFormat: {
          length: accessToken?.length,
          startsWithPat: accessToken?.startsWith('pat'),
          startsWithKey: accessToken?.startsWith('key')
        }
      }
    });
    
  } catch (error) {
    console.error('Airtable test error:', {
      message: error.message,
      stack: error.stack,
      status: error.statusCode || 'unknown'
    });
    
    return NextResponse.json({
      error: 'Airtable connection failed',
      details: {
        message: error.message,
        statusCode: error.statusCode,
        type: error.name
      },
      debug: {
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenPrefix: accessToken?.substring(0, 10),
        baseId: baseId,
        baseIdFormat: {
          length: baseId?.length,
          startsWithApp: baseId?.startsWith('app')
        }
      }
    }, { status: 500 });
  }
}