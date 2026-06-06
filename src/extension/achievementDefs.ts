import { FishSpecies, ITankStats } from '../common/types';
import type { FishSpecification } from './persistence';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    check: (stats: ITankStats, fish: FishSpecification[]) => boolean;
}

// One tick = 100 ms. 7 days in ticks = 7 * 24 * 36000.
const SEVEN_DAYS_TICKS = 7 * 24 * 36000;

export const ACHIEVEMENTS: ReadonlyArray<Achievement> = [
    {
        id: 'first-splash',
        title: 'First Splash',
        emoji: '💦',
        description: 'Add your first fish',
        check: (_s, f) => f.length >= 1,
    },
    {
        id: 'schools-in',
        title: "School's In",
        emoji: '🐟',
        description: 'Have 5 fish in the tank at once',
        check: (_s, f) => f.length >= 5,
    },
    {
        id: 'feeder',
        title: 'Feeder Frenzy',
        emoji: '🍤',
        description: 'Save files 50 times',
        check: (s) => s.totalSaves >= 50,
    },
    {
        id: 'centurion',
        title: 'Centurion',
        emoji: '💯',
        description: 'Save files 100 times',
        check: (s) => s.totalSaves >= 100,
    },
    {
        id: 'commit-hatch',
        title: 'Commit Hatcher',
        emoji: '🥚',
        description: 'Hatch a fish via git commit',
        check: (s) => s.totalCommitHatches >= 1,
    },
    {
        id: 'old-timer',
        title: 'Old Timer',
        emoji: '⏳',
        description: 'Keep a fish alive 7 days',
        check: (_s, f) => f.some((x) => x.age > SEVEN_DAYS_TICKS),
    },
    {
        id: 'diverse',
        title: 'Diverse Tank',
        emoji: '🌈',
        description: 'Three different species at once',
        check: (_s, f) => new Set(f.map((x) => x.species)).size >= 3,
    },
    {
        id: 'apex',
        title: 'Apex Predator',
        emoji: '🦈',
        description: 'Own a shark',
        check: (_s, f) => f.some((x) => x.species === FishSpecies.shark),
    },
    {
        id: 'octogarden',
        title: 'Octogarden',
        emoji: '🐙',
        description: 'Own an octopus',
        check: (_s, f) => f.some((x) => x.species === FishSpecies.octopus),
    },
    {
        id: 'committed',
        title: 'Committed',
        emoji: '🌊',
        description: 'Make 50 git commits',
        check: (s) => s.totalCommits >= 50,
    },
    {
        id: 'century-commits',
        title: 'Century Commits',
        emoji: '🏆',
        description: 'Make 100 git commits',
        check: (s) => s.totalCommits >= 100,
    },
    {
        id: 'liftoff',
        title: 'Liftoff',
        emoji: '🚀',
        description: 'Push to a remote for the first time',
        check: (s) => s.totalPushes >= 1,
    },
    {
        id: 'shipping-it',
        title: 'Shipping It',
        emoji: '📦',
        description: 'Push to a remote 25 times',
        check: (s) => s.totalPushes >= 25,
    },
    {
        id: 'branch-out',
        title: 'Branch Out',
        emoji: '🌿',
        description: 'Publish a new branch',
        check: (s) => s.totalBranchesPublished >= 1,
    },
    {
        id: 'keyboard-warrior',
        title: 'Keyboard Warrior',
        emoji: '⌨️',
        description: 'Save files 250 times',
        check: (s) => s.totalSaves >= 250,
    },
    {
        id: 'save-scummer',
        title: 'Save Scummer',
        emoji: '💾',
        description: 'Save files 500 times',
        check: (s) => s.totalSaves >= 500,
    },
    {
        id: 'prolific',
        title: 'Prolific',
        emoji: '🌳',
        description: 'Make 250 git commits',
        check: (s) => s.totalCommits >= 250,
    },
    {
        id: 'commit-legend',
        title: 'Commit Legend',
        emoji: '🏛️',
        description: 'Make 500 git commits',
        check: (s) => s.totalCommits >= 500,
    },
    {
        id: 'hatchery',
        title: 'Hatchery',
        emoji: '🐣',
        description: 'Hatch 10 fish via git commits',
        check: (s) => s.totalCommitHatches >= 10,
    },
    {
        id: 'deploy-machine',
        title: 'Deploy Machine',
        emoji: '🛰️',
        description: 'Push to a remote 100 times',
        check: (s) => s.totalPushes >= 100,
    },
    {
        id: 'branch-manager',
        title: 'Branch Manager',
        emoji: '🌲',
        description: 'Publish 10 branches',
        check: (s) => s.totalBranchesPublished >= 10,
    },
    {
        id: 'debugger',
        title: 'Debugger',
        emoji: '🐛',
        description: 'Start your first debug session',
        check: (s) => s.totalDebugSessions >= 1,
    },
    {
        id: 'bug-hunter',
        title: 'Bug Hunter',
        emoji: '🔬',
        description: 'Start 25 debug sessions',
        check: (s) => s.totalDebugSessions >= 25,
    },
    {
        id: 'exterminator',
        title: 'Exterminator',
        emoji: '🪲',
        description: 'Start 100 debug sessions',
        check: (s) => s.totalDebugSessions >= 100,
    },
    {
        id: 'it-compiles',
        title: 'It Compiles!',
        emoji: '✅',
        description: 'Finish a build or test task successfully',
        check: (s) => s.totalTasksPassed >= 1,
    },
    {
        id: 'all-green',
        title: 'All Green',
        emoji: '🟢',
        description: 'Finish 50 tasks successfully',
        check: (s) => s.totalTasksPassed >= 50,
    },
    {
        id: 'embrace-failure',
        title: 'Embrace Failure',
        emoji: '💥',
        description: 'Have a build or test task fail (it happens!)',
        check: (s) => s.totalTasksFailed >= 1,
    },
];
