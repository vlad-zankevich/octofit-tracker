import { Activity, Team, User, Workout } from '../models/index.js';

type ApiError = Error & { status: number };

function apiError(status: number, message: string): ApiError {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw apiError(400, 'Activity details are required');

  const { userId, teamId, type, minutes } = input;
  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw apiError(400, 'Valid userId and teamId are required');
  }
  if (!nonEmptyString(type)) throw apiError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw apiError(400, 'Minutes must be at least one');
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) throw apiError(400, 'The specified user or team does not exist');

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw apiError(400, 'Team details are required');

  const { name, mascot } = input;
  if (!nonEmptyString(name)) throw apiError(400, 'Team name is required');
  if (!nonEmptyString(mascot)) throw apiError(400, 'Team mascot is required');

  const members = input.members ?? [];
  if (!Array.isArray(members) || !members.every(isObjectId)) {
    throw apiError(400, 'Team members must be an array of valid user IDs');
  }
  if (members.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: members } });
    if (memberCount !== new Set(members).size) {
      throw apiError(400, 'One or more team members do not exist');
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email }).lean();
  if (!user) throw apiError(404, 'User not found');

  const [workouts, activities] = await Promise.all([
    Workout.find().lean(),
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean(),
  ]);

  const goal = user.fitnessGoal.trim().toLowerCase();
  const recentTypes = activities.map(({ type }) => type.trim().toLowerCase());
  const focusForActivity = (type: string) => {
    if (['run', 'running', 'cycle', 'cycling', 'walk', 'walking'].includes(type)) return 'endurance';
    return type;
  };
  const recentFocuses = recentTypes.map(focusForActivity);

  return workouts
    .map((workout, index) => {
      const focus = workout.focus.trim().toLowerCase();
      let priority = 2;
      let reason = 'Recommended as a varied workout for your training.';
      if (focus === goal) {
        priority = 0;
        reason = `Matches your ${user.fitnessGoal} fitness goal.`;
      } else {
        const activityIndex = recentFocuses.indexOf(focus);
        if (activityIndex >= 0) {
          priority = 1;
          reason = `Builds on your recent ${activities[activityIndex].type} activity.`;
        }
      }
      return { workout, priority, index, reason };
    })
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
