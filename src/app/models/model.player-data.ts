import { LeaderboardEntry } from './model.leaderboard-entry';
import { RatioEntry } from './models.ratio-entry';

export class PlayerData{
    DataDate : Date;
    State : LeaderboardEntry;
    Progress : LeaderboardEntry;
    Ratios : RatioEntry
}