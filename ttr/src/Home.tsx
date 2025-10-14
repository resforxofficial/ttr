import { useEffect, useState } from "react";
import { useBattleStore } from "./zuct";

export default function RealTimeBattle() {
    const {
        attackEnemy,
        attackPlayer,
        isGameOver,
        resetGame,
        upgradeAttack,
        upgradeMaxHp,
        player,
        enemy,
        logs,
        healPlayer,
        upgradeRegen,
    } = useBattleStore();
    const [activeTab, setActiveTab] = useState<"stats" | "shop">("stats");

    // 플레이어 자동 공격
    useEffect(() => {
        if (isGameOver) return;
        const interval = setInterval(() => {
            attackEnemy();
        }, player.attackSpeed);
        return () => clearInterval(interval);
    }, [attackEnemy, player.attackSpeed, isGameOver]);

    // 적 자동 공격
    useEffect(() => {
        if (isGameOver) return;
        const interval = setInterval(() => {
            attackPlayer();
        }, enemy.attackSpeed);
        return () => clearInterval(interval);
    }, [attackPlayer, enemy.attackSpeed, isGameOver]);

    useEffect(() => {
        if (isGameOver) return;
        const interval = setInterval(() => {
            healPlayer(player.regen); // 초당 1씩 회복
        }, 500);

        return () => clearInterval(interval);
    }, [isGameOver, healPlayer, player.regen]); // player.hp 넣지 않음!

    return (
        <div>
            <div className="battle-wrapper">
                {/* 왼쪽: 배틀 화면 */}
                <div className="battle-container">
                    <h2>실시간 자동 전투</h2>

                    {isGameOver ? (
                        <div className="game-over">
                            <h3>게임 오버!</h3>
                            <button onClick={resetGame}>다시 시작</button>
                        </div>
                    ) : (
                        <div className="entities-row">
                            <div className="entity-container">
                                <h3>플레이어</h3>
                                <p>
                                    체력: {player.hp} / {player.maxHp}
                                </p>
                                <div className="hp-bar">
                                    <div
                                        className="hp-fill player-fill"
                                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="entity-container">
                                <h3>
                                    {enemy.name} Lv. {enemy.level}
                                </h3>
                                <p>
                                    체력: {enemy.hp} / {enemy.maxHp}
                                </p>
                                <div className="hp-bar">
                                    <div
                                        className="hp-fill enemy-fill"
                                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 로그 + 스탯 */}
                <div className="sidebar">
                    {/* 전투 로그 */}
                    <div className="logs">
                        <h3>전투 로그</h3>
                        <div className="log-list">
                            {logs.slice(-10).map((log, idx) => (
                                <p key={idx}>{log}</p>
                            ))}
                        </div>
                    </div>

                    {/* 플레이어 스탯 */}
                    <div className="player-stats">
                        <h3>플레이어 스탯</h3>
                        <p>
                            공격력: {player.attack} (Lv.{player.attackLevel})
                        </p>
                        <p>
                            최대 체력: {player.maxHp} (Lv.{player.maxHpLevel})
                        </p>
                        <p>
                            초당 회복 : {player.regen} (Lv.{player.regenLevel})
                        </p>
                        <p>남은 스탯 포인트: {player.statPoints}</p>
                        <button onClick={upgradeAttack} disabled={player.statPoints <= 0}>
                            공격력 +2
                        </button>
                        <button onClick={upgradeMaxHp} disabled={player.statPoints <= 0}>
                            최대 체력 +5
                        </button>
                        <button onClick={upgradeRegen} disabled={player.statPoints <= 0}>
                            초당회복 + 1
                        </button>
                    </div>
                </div>
            </div>
            <br />
            <div className="info-navbar">
                <button
                    className={activeTab === "stats" ? "active" : ""}
                    onClick={() => setActiveTab("stats")}
                >
                    스탯
                </button>
                <button
                    className={activeTab === "shop" ? "active" : ""}
                    onClick={() => setActiveTab("shop")}
                >
                    인벤토리
                </button>
            </div>
            <div className="info-wrapper">
                {activeTab === "stats" && (
                    <div className="info-block">
                        <h4>플레이어 정보</h4>
                        <p>
                            공격력: {player.attack} (Lv.{player.attackLevel})
                        </p>
                        <p>
                            최대 체력: {player.maxHp} (Lv.{player.maxHpLevel})
                        </p>
                        <p>
                            초당 회복: {player.regen} (Lv.{player.regenLevel})
                        </p>
                        <p>남은 스탯 포인트: {player.statPoints}</p>
                    </div>
                )}

                {activeTab === "shop" && (
                    <div className="info-block">
                        <h4>인벤토리</h4>
                        <p>아이템 리스트가 여기 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
