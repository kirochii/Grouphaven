import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config({ path: '../../../netlify/.env' });
import { createGroupChannel } from '../../../GrouphavenApp/app/chat/CreateGroupChannel.js';

// Create a single supabase client for interacting with your database
const supabase = createClient('https://lrryxyalvumuuvefxhrg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c')
const supabaseAdmin = createClient('https://lrryxyalvumuuvefxhrg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzU0MjUxNSwiZXhwIjoyMDQ5MTE4NTE1fQ.k7mN8J2B11ziQnSU8DNQbH798HijEe3wP9G3ZeYHxwI');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'hozx-wp22@student.tarc.edu.my';

class User {
  constructor(id, gender, isTrusted, sameGender, age, minAge, maxAge, city, isHost, minGroup, maxGroup, interests) {
    this.id = id;
    this.gender = gender;
    this.isTrusted = isTrusted;
    this.sameGender = sameGender;
    this.age = age;
    this.minAge = minAge;
    this.maxAge = maxAge;
    this.city = city;
    this.isHost = isHost;
    this.minGroup = minGroup;
    this.maxGroup = maxGroup;
    this.interests = Array.isArray(interests) ? interests : [];
  }
}

class Group {
  constructor(user) {
    this.users = [];
    this.minAge = 0;
    this.maxAge = 0;
    this.minGroup = 0;
    this.maxGroup = 0;
    this.city = '';
    this.interests = [];

    if (user instanceof User) {
      this.addUser(user);
    } else {
      throw new Error("A valid User must be provided when creating a Group.");
    }
  }

  addUser(user) {
    if (user instanceof User) {
      this.users.push(user);
      this.setMetrics();
    } else {
      throw new Error("Only User instances can be added.");
    }
  }

  setMetrics() {
    // In case group has no users, reset metrics and return
    if (this.users.length === 0) {
      this.minAge = 0;
      this.maxAge = 0;
      this.minGroup = 0;
      this.maxGroup = 0;
      this.city = '';
      this.interests = [];
      return;
    }

    // Declare variables
    let totalMinAge = 0;
    let totalMaxAge = 0;
    let totalMinGroup = 0;
    let totalMaxGroup = 0;
    const cityCounts = {};
    let allInterests = new Set();

    // Sum the metrics
    for (const user of this.users) {
      totalMinAge += user.minAge;
      totalMaxAge += user.maxAge;
      totalMinGroup += user.minGroup;
      totalMaxGroup += user.maxGroup;
      cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
      user.interests.forEach(interest => allInterests.add(interest));
    }

    const count = this.users.length || 1;

    // Average the metrics
    this.minAge = Math.round(totalMinAge / count);
    this.maxAge = Math.round(totalMaxAge / count);
    this.minGroup = Math.round(totalMinGroup / count);
    this.maxGroup = Math.round(totalMaxGroup / count);
    this.city = Object.entries(cityCounts).reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
    this.interests = [...allInterests];
  }
}

// Weights for each feature
const weights = {
  age: 0.2,
  age_pref: 0.2,
  city: 0.1,
  group_size: 0.25,
  interests: 0.25,
};

async function getUsers() {
  const { data, error } = await supabase
    .from('match_preference')
    .select('*'); // selects all columns

  if (error) {
    console.error('Error fetching match preferences:', error.message);
    return [];
  }

  return data.map(row => new User(
    row.id,
    row.user_gender,
    row.user_is_trusted,
    row.same_gender,
    row.user_age,
    row.min_age_pref,
    row.max_age_pref,
    row.user_city,
    row.user_is_host,
    row.min_group_size,
    row.max_group_size,
    row.interests
  ));
}

function hardClustering(userList) {
  // Structure for hard constraint grouping
  const treeGroups = {
    'Trusted': {
      'Male': [],
      'Female': [],
      'Mixed': [],
    },
    'Not Trusted': {
      'Male': [],
      'Female': [],
      'Mixed': [],
    },
  };

  userList.forEach(user => {
    const trustKey = user.isTrusted ? 'Trusted' : 'Not Trusted';

    if (user.sameGender) {
      if (user.gender === 'male') {
        treeGroups[trustKey]['Male'].push(user);
      } else if (user.gender === 'female') {
        treeGroups[trustKey]['Female'].push(user);
      }
    } else {
      treeGroups[trustKey]['Mixed'].push(user);
    }
  });

  return treeGroups;
}

function softClustering(treeGroups) {
  const allUserGroups = [];

  // Loop through "Trusted" and "Not Trusted"
  for (const trustGroupKey in treeGroups) {
    const subGroups = treeGroups[trustGroupKey];

    // Loop through "Male", "Female", "Mixed"
    for (const genderGroupKey in subGroups) {
      const users = subGroups[genderGroupKey];

      if (!Array.isArray(users) || users.length === 0) continue;

      const userGroups = [];

      // Initialize the first group with the first user
      userGroups.push(new Group(users[0]));

      for (let i = 1; i < users.length; i++) {
        const user = users[i];
        let placed = false;

        for (const group of userGroups) {
          const score = calcCompatibility(user, group);

          if (score >= 80) {
            group.addUser(user);
            placed = true;
            break;
          }
        }

        if (!placed) {
          userGroups.push(new Group(user));
        }
      }

      // ---- Step 2: Host balancing ----

      // Groups without hosts
      const hostlessGroups = userGroups.filter(
        g => !g.users.some(u => u.isHost)
      );

      // Groups with more than 1 hosts
      const excessHostGroups = userGroups.filter(
        g => g.users.filter(u => u.isHost).length > 1
      );

      for (const group of excessHostGroups) {
        // Get all hosts in group
        const hosts = group.users.filter(u => u.isHost);

        // Keep the first host, reassign the other hosts
        for (let i = 1; i < hosts.length; i++) {
          const host = hosts[i];

          for (let j = 0; j < hostlessGroups.length; j++) {
            const targetGroup = hostlessGroups[j];
            const score = calcCompatibility(host, targetGroup);

            if (score >= 80) {
              // Move host to target group
              targetGroup.addUser(host);
              group.users = group.users.filter(u => u !== host); // Remove host
              group.setMetrics();
              targetGroup.setMetrics();

              // Remove from hostless list
              hostlessGroups.splice(j, 1);
              break;
            }
          }
        }
      }

      // ---- Step 3: Limit hosts per group ----
      const filteredGroups = userGroups.filter(group => group.users.length > 1 && group.users.some(u => u.isHost));

      for (const group of filteredGroups) {
        const hosts = group.users.filter(u => u.isHost);

        if (hosts.length > 1) {
          // Keep only the first host
          for (let i = 1; i < hosts.length; i++) {
            hosts[i].isHost = false;
          }
        }
      }

      allUserGroups.push(...filteredGroups);
    }
  }

  return allUserGroups;
}

function calcCompatibility(user, group) {
  // 1. Age in group range
  const age_score =
    group.minAge <= user.age && user.age <= group.maxAge ? 1.0 : 0.0;

  // 2. Group age range in user's preferred age range (inverse match)
  let age_pref_score = 0.0;
  if (user.minAge <= group.minAge && user.maxAge >= group.maxAge) {
    age_pref_score = 1.0;
  } else if (user.maxAge >= group.minAge && user.minAge <= group.maxAge) {
    age_pref_score = 0.5;
  }

  // 3. City match
  const city_score = group.city === user.city ? 1.0 : 0.0;

  // 4. Group size preference
  const new_size = group.users.length + 1;
  let group_size_score = 0.0;

  if (new_size > user.maxGroup) {
    group_size_score = 0.0;
  } else if (new_size >= user.minGroup) {
    group_size_score = 1.0;
  } else {
    group_size_score = 0.5;
  }

  // 5. Interests overlap (Jaccard similarity)
  let interests_score;

  if (user.interests.length === 0 || group.interests.length == 0) {
    interests_score = 1.0;
  } else {
    const userInterests = new Set(user.interests);
    const groupInterests = new Set(group.interests);
    const intersection = [...userInterests].filter(i => groupInterests.has(i));
    const diceDenominator = userInterests.size + groupInterests.size;
    interests_score = diceDenominator === 0 ? 0.0 : (2 * intersection.length) / diceDenominator;
  }

  // Final weighted score
  const final_score =
    age_score * weights.age +
    age_pref_score * weights.age_pref +
    city_score * weights.city +
    group_size_score * weights.group_size +
    interests_score * weights.interests;

  console.log("\nUser ID:", user.id);
  console.log("Age score:", age_score);
  console.log("Age pref score:", age_pref_score);
  console.log("City score:", city_score);
  console.log("Group size score:", group_size_score);
  console.log("Interests score:", interests_score);
  console.log("Final score:", final_score);

  return Math.round(final_score * 10000) / 100; // percentage, rounded to 2 decimal places
}

async function insertDB(userGroups) {
  for (const group of userGroups) {
    // Step 1: Insert group row into 'group' table
    const { data: groupData, error: groupError } = await supabase
      .from('group')
      .insert({
        name: 'New Group',
        date_created: new Date().toISOString().split('T')[0],
        interests: group.interests,
      })
      .select('group_id')  // get the inserted group ID
      .single();

    if (groupError) {
      console.error('Error inserting group:', groupError);
      continue;
    }

    const groupId = groupData.group_id;

    // Step 2: Prepare user_group insert entries
    const userGroupEntries = group.users.map(user => ({
      id: user.id,
      group_id: groupId,
      is_host: user.isHost
    }));

    // Step 3: Insert into user_group table
    const { error: userGroupError } = await supabase
      .from('user_group')
      .insert(userGroupEntries);

    if (userGroupError) {
      console.error('Error inserting user_group links:', userGroupError);
    }

    // Step 3.5: Create group channel using Stream
    try{
      await createGroupChannel(groupData.group_id, groupData.name, group.users);
    }catch (error) {
      console.error('Error creating group channel:', error);
    }

    // Step 4: Remove users from match_preference
    const userIds = group.users.map(user => user.id);
    const { error: deleteError } = await supabase
      .from('match_preference')
      .delete()
      .in('id', userIds);

    if (deleteError) {
      console.error('Error deleting grouped users from match_preference:', deleteError);
    }

    // Step 5: Send email notification
    for (const user of group.users) {
      try {
        // Fetch user email by user ID from Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (authError || !authUser) {
          console.error(`Error fetching auth user ${user.id}:`, authError);
          continue;
        }

        const email = authUser.user.email;
        if (!email) {
          console.warn(`No email found for user ID ${user.id}`);
          continue;
        }

        await sendEmail(email);

      } catch (err) {
        console.error(`Error sending email to user ID ${user.id}:`, err);
      }
    }

  }
}

async function sendEmail(TO_EMAIL) {
  const emailBody = {
    personalizations: [
      {
        to: [{ email: TO_EMAIL }],
        subject: 'Match Successful!',
      },
    ],
    from: {
      email: FROM_EMAIL,
      name: 'Grouphaven'
    },
    content: [
      {
        type: 'text/plain',
        value: 'You have been matched into a group! Check it out in the Grouphaven app now!',
      },
    ],
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid Error: ${response.status} - ${error}`);
    }

    return {
      statusCode: 200,
      body: 'Email sent successfully!',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error sending email: ${error.message}`,
    };
  }
}

export default async (req) => {
  const userList = await getUsers();
  const treeGroups = hardClustering(userList);
  const allUserGroups = softClustering(treeGroups);
  await insertDB(allUserGroups);
  console.log(treeGroups);
  console.log("\nAll User Groups: ", allUserGroups);
}

export const config = {
  schedule: '@hourly',
}

const userList = await getUsers();
const treeGroups = hardClustering(userList);
const allUserGroups = softClustering(treeGroups);
await insertDB(allUserGroups);
console.log(treeGroups);
console.log("\nAll User Groups: ", allUserGroups);