import * as cc from "cc";

const { ccclass, property } = cc._decorator;

export enum FishID
{
    Fish1 = 0,
    Fish2 = 1,
    Fish3 = 2,
    Fish4 = 3,
}
export type FishProbability = { MinRewardThreshold: number, MaxRewardThreshold: number, HitRate: number };
export const FishHitSetting: Record<FishID, FishProbability> =
{
    [ FishID.Fish1 ]: {
        MinRewardThreshold: 0,
        MaxRewardThreshold: 2,
        HitRate: 0.8
    },
    [ FishID.Fish2 ]: {
        MinRewardThreshold: 3,
        MaxRewardThreshold: 5,
        HitRate: 0.8
    },
    [ FishID.Fish3 ]: {
        MinRewardThreshold: 10,
        MaxRewardThreshold: 20,
        HitRate: 0.5
    },
    [ FishID.Fish4 ]: {
        MinRewardThreshold: 20,
        MaxRewardThreshold: 40,
        HitRate: 0.3
    }

};

@ccclass( "FishSetting" )
export class FishSetting extends cc.Component
{
    @property( { type: cc.Enum( FishID ), tooltip: "Fish ID" } )
    public FishID: FishID; // 魚的ID
}