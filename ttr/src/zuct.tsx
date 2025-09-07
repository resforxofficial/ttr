import { create } from "zustand";

// 레벨별 적 이름
const enemyNames = ["슬라임", "고블린", "오크", "트롤", "마법사", "드래곤"];
const getEnemyName = (level: number) =>
    enemyNames[level - 1] || `보스 Lv.${level}`;

interface Entity {
    hp: number;
    maxHp: number;
    attack: number;
    attackSpeed: number;
    level?: number;
    name?: string;
}

interface BattleState {
    player: Entity & {
        statPoints: number; // 스탯 포인트
        attackLevel: number;
        maxHpLevel: number;
    };
    enemy: Entity;
    isGameOver: boolean;
    logs: string[];
    attackEnemy: () => void;
    attackPlayer: () => void;
    resetGame: () => void;
    upgradeAttack: () => void;
    upgradeMaxHp: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
    player: {
        hp: 50,
        maxHp: 50,
        attack: 5,
        attackSpeed: 1000,
        statPoints: 0,
        attackLevel: 0,
        maxHpLevel: 0,
    },
    enemy: {
        hp: 20,
        maxHp: 20,
        attack: 3,
        attackSpeed: 1000,
        level: 1,
        name: "슬라임",
    },
    isGameOver: false,
    logs: ["게임을 시작합니다!"],

    attackEnemy: () =>
        set((state) => {
            if (state.isGameOver) return state;

            const newHp = state.enemy.hp - state.player.attack;
            const newLogs = [
                ...state.logs,
                `플레이어가 ${state.enemy.name}에게 ${state.player.attack} 피해!`,
            ];

            if (newHp <= 0) {
                // 몬스터 처치 시 스탯 포인트 2 지급
                const nextLevel = (state.enemy.level || 1) + 1;
                const newEnemy = {
                    level: nextLevel,
                    name: getEnemyName(nextLevel),
                    maxHp: 20 + nextLevel * 5,
                    hp: 20 + nextLevel * 5,
                    attack: 3 + nextLevel,
                    attackSpeed: 1000,
                };
                newLogs.push(`${newEnemy.name} 등장! 레벨 ${nextLevel}`);
                newLogs.push(`플레이어에게 스탯 포인트 +2`);

                return {
                    ...state,
                    enemy: newEnemy,
                    player: { ...state.player, statPoints: state.player.statPoints + 2 },
                    logs: newLogs,
                };
            }

            return { ...state, enemy: { ...state.enemy, hp: newHp }, logs: newLogs };
        }),

    attackPlayer: () =>
        set((state) => {
            if (state.isGameOver) return state;
            const newHp = state.player.hp - state.enemy.attack;
            const newLogs = [
                ...state.logs,
                `${state.enemy.name}가 플레이어에게 ${state.enemy.attack} 피해!`,
            ];

            if (newHp <= 0) {
                newLogs.push("플레이어가 사망했습니다!");
                return {
                    ...state,
                    player: { ...state.player, hp: 0 },
                    isGameOver: true,
                    logs: newLogs,
                };
            }

            return {
                ...state,
                player: { ...state.player, hp: newHp },
                logs: newLogs,
            };
        }),

    resetGame: () =>
        set(() => ({
            player: {
                hp: 50,
                maxHp: 50,
                attack: 5,
                attackSpeed: 1000,
                statPoints: 0,
                attackLevel: 0,
                maxHpLevel: 0,
            },
            enemy: {
                hp: 20,
                maxHp: 20,
                attack: 3,
                attackSpeed: 1000,
                level: 1,
                name: "슬라임",
            },
            isGameOver: false,
            logs: ["게임을 다시 시작합니다!"],
        })),

    // 스탯 업그레이드 함수
    upgradeAttack: () =>
        set((state) => {
            if (state.player.statPoints <= 0) return state;
            return {
                ...state,
                player: {
                    ...state.player,
                    attack: state.player.attack + 1,
                    statPoints: state.player.statPoints - 1,
                    attackLevel: state.player.attackLevel + 1,
                },
                logs: [...state.logs, `플레이어 공격력 +1`],
            };
        }),

    upgradeMaxHp: () =>
        set((state) => {
            if (state.player.statPoints <= 0) return state;
            return {
                ...state,
                player: {
                    ...state.player,
                    maxHp: state.player.maxHp + 5,
                    statPoints: state.player.statPoints - 1,
                    maxHpLevel: state.player.maxHpLevel + 1,
                },
                logs: [...state.logs, `플레이어 최대 체력 +5`],
            };
        }),
}));
