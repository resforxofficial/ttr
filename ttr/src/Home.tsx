import { useEffect } from "react";
import { useBattleStore } from "./zuct";

export default function RealTimeBattle() {
    // 공격 함수만 가져오기
    const attackEnemy = useBattleStore((s) => s.attackEnemy);
    const attackPlayer = useBattleStore((s) => s.attackPlayer);
    const getState = useBattleStore.getState; // 상태 직접 접근용

    // 플레이어 자동 공격
    useEffect(() => {
        const interval = setInterval(() => {
            attackEnemy(); // 상태 내부에서 player.attackSpeed 사용
        }, getState().player.attackSpeed);
        return () => clearInterval(interval);
    }, [attackEnemy]);

    // 적 자동 공격
    useEffect(() => {
        const interval = setInterval(() => {
            attackPlayer(); // 상태 내부에서 enemy.attackSpeed 사용
        }, getState().enemy.attackSpeed);
        return () => clearInterval(interval);
    }, [attackPlayer]);

    // 화면 렌더링용 상태
    const playerHp = useBattleStore((s) => s.player.hp);
    const playerMax = useBattleStore((s) => s.player.maxHp);
    const enemyHp = useBattleStore((s) => s.enemy.hp);
    const enemyMax = useBattleStore((s) => s.enemy.maxHp);

    return (
        <div className="battle-container">
            <h2>실시간 자동 전투</h2>

            <div className="entities-row">
                <div className="entity-container">
                    <h3>플레이어</h3>
                    <p>
                        체력: {playerHp} / {playerMax}
                    </p>
                    <div className="hp-bar">
                        <div
                            className="hp-fill player-fill"
                            style={{ width: `${(playerHp / playerMax) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="entity-container">
                    <h3>적</h3>
                    <p>
                        체력: {enemyHp} / {enemyMax}
                    </p>
                    <div className="hp-bar">
                        <div
                            className="hp-fill enemy-fill"
                            style={{ width: `${(enemyHp / enemyMax) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
