import { create } from "zustand";
import { josa } from "es-hangul";

// 레벨별 적 이름
const enemyNames = ["슬라임", "고블린", "오크", "트롤", "마법사", "드래곤"];
const getEnemyName = (level: number) => enemyNames[level - 1] || `보스`;

interface Entity {
    hp: number;
    maxHp: number;
    attack: number;
    attackSpeed: number;
    level: number;
    name: string;
}

interface Player extends Entity {
    statPoints: number;
    attackLevel: number;
    maxHpLevel: number;
    regen: number;
    regenLevel: number;
}

interface BattleState {
    player: Player;
    enemy: Entity;
    isGameOver: boolean;
    logs: string[];
    attackEnemy: () => void;
    attackPlayer: () => void;
    resetGame: () => void;
    upgradeAttack: () => void;
    upgradeMaxHp: () => void;
    healPlayer: (amount: number) => void;
    upgradeRegen: () => void;
}

interface InventoryItem {
    id: string;
    name: string;
    type: "sub" | "complete";
    quantity: number;
    description?: string;
}

interface InventoryState {
    inventory: InventoryItem[];
    addItem: (item: Omit<InventoryItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string, quantity?: number) => void;
    clearInventory: () => void;
}

type T = BattleState & InventoryState;

const MAX_LOGS = 50;

export const useBattleStore = create<T>((set) => ({
    player: {
        hp: 100,
        maxHp: 100,
        attack: 5,
        attackSpeed: 1000,
        statPoints: 0,
        attackLevel: 0,
        maxHpLevel: 0,
        level: 1,
        name: "플레이어",
        regen: 1,
        regenLevel: 0,
    },
    enemy: {
        hp: 220,
        maxHp: 220,
        attack: 3,
        attackSpeed: 1000,
        level: 1,
        name: "슬라임",
    },
    isGameOver: false,
    logs: ["게임을 시작합니다!"],
    inventory: [],

    addItem: (item, quantity = 1) =>
        set((state) => {
            const existing = state.inventory.find((i) => i.id === item.id);
            if (existing) {
                return {
                    inventory: state.inventory.map((i) =>
                        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                    ),
                };
            }
            return {
                inventory: [...state.inventory, { ...item, quantity }],
            };
        }),

    removeItem: (id, quantity = 1) =>
        set((state) => {
            return {
                inventory: state.inventory
                    .map((i) =>
                        i.id === id ? { ...i, quantity: i.quantity - quantity } : i
                    )
                    .filter((i) => i.quantity > 0),
            };
        }),

    clearInventory: () => set({ inventory: [] }),

    attackEnemy: () =>
        set((state) => {
            if (state.isGameOver) return state;

            const newHp = state.enemy.hp - state.player.attack;
            const newLogs = [
                ...state.logs,
                `플레이어가 ${state.enemy.name}에게 ${state.player.attack} 피해!`,
            ];

            if (newHp <= 0) {
                // 🔹 다음 몬스터 세팅
                const nextLevel = (state.enemy.level || 1) + 1;
                const newEnemy = {
                    level: nextLevel,
                    name: getEnemyName(nextLevel),
                    maxHp: 220 + nextLevel * 5,
                    hp: 220 + nextLevel * 5,
                    attack: (2 + nextLevel) * 2,
                    attackSpeed: 1000,
                };

                // 🔹 잃은 체력의 30% 회복
                const missingHp = state.player.maxHp - state.player.hp;
                const healAmount = Math.floor(missingHp * 0.7);
                const healedHp = Math.min(
                    state.player.hp + healAmount,
                    state.player.maxHp
                );

                newLogs.push(`${state.enemy.name} 처치!`);
                newLogs.push(`플레이어 체력 ${healAmount} 회복!`);
                newLogs.push(`${newEnemy.name} 등장! 레벨 ${nextLevel}`);
                newLogs.push(`플레이어에게 스탯 포인트 +2`);

                return {
                    ...state,
                    enemy: newEnemy,
                    player: {
                        ...state.player,
                        hp: healedHp,
                        statPoints: state.player.statPoints + 2,
                    },
                    logs: newLogs,
                };
            }

            return {
                ...state,
                enemy: { ...state.enemy, hp: newHp },
                logs: newLogs,
            };
        }),

    attackPlayer: () =>
        set((state) => {
            if (state.isGameOver) return state;

            const newHp = state.player.hp - state.enemy.attack;
            const newLogs = [
                ...state.logs,
                `${josa(state.enemy.name, "이/가")} 플레이어에게 ${state.enemy.attack
                } 피해!`,
            ];

            if (newHp <= 0) {
                return {
                    ...state,
                    player: { ...state.player, hp: 0 },
                    isGameOver: true,
                    logs: [...newLogs, "플레이어가 사망했습니다!"].slice(-MAX_LOGS),
                };
            }

            return {
                ...state,
                player: { ...state.player, hp: newHp },
                logs: newLogs.slice(-MAX_LOGS),
            };
        }),

    resetGame: () =>
        set((state) => ({
            player: {
                ...state.player,
                hp: state.player.maxHp, // 체력만 최대치로 회복
            },
            enemy: {
                ...state.enemy,
                hp: state.enemy.maxHp, // 적 체력도 다시 채움
            },
            isGameOver: false,
            logs: ["게임을 다시 시작합니다!"],
        })),

    upgradeAttack: () =>
        set((state) => {
            if (state.player.statPoints <= 0) return state;
            const newLogs = [...state.logs, `플레이어 공격력 +1`];
            return {
                ...state,
                player: {
                    ...state.player,
                    attack: state.player.attack + 2,
                    attackLevel: state.player.attackLevel + 1,
                    statPoints: state.player.statPoints - 1,
                },
                logs: newLogs.slice(-MAX_LOGS),
            };
        }),

    upgradeMaxHp: () =>
        set((state) => {
            if (state.player.statPoints <= 0) return state;
            const newLogs = [...state.logs, `플레이어 최대 체력 +5`];
            return {
                ...state,
                player: {
                    ...state.player,
                    maxHp: state.player.maxHp + 5,
                    maxHpLevel: state.player.maxHpLevel + 1,
                    statPoints: state.player.statPoints - 1,
                },
                logs: newLogs.slice(-MAX_LOGS),
            };
        }),

    // 스토어 내부에 추가
    healPlayer: (amount: number) =>
        set((state) => {
            const newHp = Math.min(state.player.hp + amount, state.player.maxHp);
            return {
                ...state,
                player: { ...state.player, hp: newHp },
            };
        }),
        
    upgradeRegen: () =>
        set((state) => {
            if (state.player.statPoints <= 0 || state.player.regenLevel >= 5) return state;
            const newLogs = [...state.logs, `플레이어 초당 회복량 +1`];
            return {
                ...state,
                player: {
                    ...state.player,
                    regen: state.player.regen + 1,
                    regenLevel: state.player.regenLevel + 1,
                    statPoints: state.player.statPoints - 1,
                },
                logs: newLogs.slice(-MAX_LOGS),
            };
        }),
}));
