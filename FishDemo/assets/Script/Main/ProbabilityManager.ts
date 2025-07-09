import { FishHitSetting, FishSetting } from "../Fish/FishSetting";


//RTP設定
const RTPSetting: number = 0.98;
//RTP偏差範圍
const RTPDeviation: number = 0.08;
//最大重試次數
const RetryMaxCount: number = 10;
/**
 * 機率計算
 */
export class ProbabilityManager
{
    private static _instance: ProbabilityManager = null;
    private _currentRTP: number = 0;
    private _totalBet: number = 0;
    private _totalWin: number = 0;
    private _calculateRetryCount: number = 0; // 計算重試次數
    private constructor() { }
    public static get Instance(): ProbabilityManager
    {
        if ( !ProbabilityManager._instance )
        {
            ProbabilityManager._instance = new ProbabilityManager();
        }
        return ProbabilityManager._instance;
    }


    public get CurrentRTP(): number
    {
        return this._currentRTP;
    }


    /**
     * 命中計算
     * @param bet 押注 
     * @param min 最低門檻
     * @param max 最高門檻
     * @returns 
     */
    public Hit( bet: number, fishSetting: FishSetting ): number
    {
        this._totalBet += bet;
        this._calculateRetryCount = 0;
        if ( this._currentRTP > RTPSetting )
        {
            this.calculateRTP();
            return 0;
        }
        else
        {
            const reward = this.isHit( fishSetting ) ? this.calculateReward( bet, fishSetting ) : 0;
            this.calculateRTP();
            return reward; //命中
        }
    }

    /**
     * 是否成功命中
     * @param fishSetting 
     * @returns 
     */
    private isHit( fishSetting: FishSetting ): boolean
    {
        if ( !FishHitSetting[ fishSetting.FishID ] )
        {
            return false;
        }
        // 使用設定中的命中率
        return Math.random() < FishHitSetting[ fishSetting.FishID ]?.HitRate; // 50% 命中率
    }
    /**
     * 計算開獎
     * @param bet 押注
     * @param min 最低門檻
     * @param max 最高門檻
     * @returns 
     */
    private calculateReward( bet: number, fishSetting: FishSetting ): number
    {
        if ( this._calculateRetryCount > RetryMaxCount )
        {
            // 超過最大重試次數，返回0
            return 0;
        }
        if ( !FishHitSetting[ fishSetting.FishID ] )
        {
            //沒有對應的設定
            return 0;
        }
        const min = FishHitSetting[ fishSetting.FishID ].MinRewardThreshold;
        const max = FishHitSetting[ fishSetting.FishID ].MaxRewardThreshold;
        this._calculateRetryCount++;
        //獎勵倍數
        const rewardMultiple = Math.floor( Math.random() * ( max + 1 ) );
        //獲獎金額
        const reward = bet * rewardMultiple;
        const trialCalculationRTP = ( this._totalWin + reward ) / this._totalBet;
        //檢查RTP是否在範圍內與最小倍數
        if ( trialCalculationRTP > RTPSetting + RTPDeviation || rewardMultiple < min )
        {
            // 如果超過RTP範圍，重新計算
            return this.calculateReward( bet, fishSetting );
        }
        this._totalWin += reward;
        return reward;
    }


    /**
     * 計算RTP
     */
    private calculateRTP(): void
    {
        this._currentRTP = this._totalWin / this._totalBet;
        console.warn( "CurrentRTP", this._currentRTP );
    }
}