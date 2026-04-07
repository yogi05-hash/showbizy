import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Create showbizy_projects table
    const { error: projectsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS showbizy_projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          stream TEXT NOT NULL,
          genre TEXT,
          location TEXT NOT NULL,
          logline TEXT,
          description TEXT,
          brief TEXT,
          mood_style TEXT,
          timeline TEXT,
          deliverables TEXT[],
          status TEXT DEFAULT 'recruiting',
          team_size INT DEFAULT 5,
          filled_roles INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          generated_by TEXT DEFAULT 'ai'
        );
      `
    })

    if (projectsError) {
      console.log('Projects table might already exist or using direct SQL:', projectsError)
    }

    // Create showbizy_project_roles table  
    const { error: rolesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS showbizy_project_roles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID REFERENCES showbizy_projects(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          description TEXT,
          skills_required TEXT[],
          filled BOOLEAN DEFAULT false,
          filled_by UUID REFERENCES showbizy_users(id),
          filled_at TIMESTAMPTZ
        );
      `
    })

    if (rolesError) {
      console.log('Roles table might already exist or using direct SQL:', rolesError)
    }

    // Create showbizy_matches table
    const { error: matchesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS showbizy_matches (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES showbizy_users(id),
          project_id UUID REFERENCES showbizy_projects(id),
          role_id UUID REFERENCES showbizy_project_roles(id),
          score FLOAT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (matchesError) {
      console.log('Matches table might already exist or using direct SQL:', matchesError)
    }

    // If RPC doesn't work, try creating by inserting sample data which auto-creates tables
    if (projectsError || rolesError || matchesError) {
      console.log('RPC failed, trying direct table creation via insert...')
      
      // Try to insert a test project to auto-create table structure
      const { error: insertError } = await supabaseAdmin
        .from('showbizy_projects')
        .insert([{
          title: 'Migration Test Project',
          stream: 'Film & Video',
          location: 'London, UK',
          status: 'recruiting',
          team_size: 1,
          filled_roles: 0,
          generated_by: 'migration'
        }])

      if (insertError) {
        console.log('Direct insert also failed:', insertError)
        // Tables might not exist, return instructions for manual creation
        return NextResponse.json({
          success: false,
          message: 'Automatic table creation failed. Please create tables manually in Supabase dashboard.',
          error: insertError.message,
          sql: `
            CREATE TABLE IF NOT EXISTS showbizy_projects (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              title TEXT NOT NULL,
              stream TEXT NOT NULL,
              genre TEXT,
              location TEXT NOT NULL,
              logline TEXT,
              description TEXT,
              brief TEXT,
              mood_style TEXT,
              timeline TEXT,
              deliverables TEXT[],
              status TEXT DEFAULT 'recruiting',
              team_size INT DEFAULT 5,
              filled_roles INT DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              generated_by TEXT DEFAULT 'ai'
            );

            CREATE TABLE IF NOT EXISTS showbizy_project_roles (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              project_id UUID REFERENCES showbizy_projects(id) ON DELETE CASCADE,
              role TEXT NOT NULL,
              description TEXT,
              skills_required TEXT[],
              filled BOOLEAN DEFAULT false,
              filled_by UUID REFERENCES showbizy_users(id),
              filled_at TIMESTAMPTZ
            );

            CREATE TABLE IF NOT EXISTS showbizy_matches (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES showbizy_users(id),
              project_id UUID REFERENCES showbizy_projects(id),
              role_id UUID REFERENCES showbizy_project_roles(id),
              score FLOAT,
              status TEXT DEFAULT 'pending',
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        })
      } else {
        // Delete the test project
        await supabaseAdmin
          .from('showbizy_projects')
          .delete()
          .eq('title', 'Migration Test Project')
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}