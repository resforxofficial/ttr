// store/battleStore.ts
import { create } from "zustand";

interface Entity {
    hp: number;
    maxHp: number;
    attack: number;
    attackSpeed: number;
}

interface BattleState {
    player: Entity;
    enemy: Entity;
    attackEnemy: () => void;
    attackPlayer: () => void;
    respawnEnemy: () => void;
    resetPlayer: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
    player: { hp: 50, maxHp: 50, attack: 5, attackSpeed: 1000 },
    enemy: { hp: 20, maxHp: 20, attack: 3, attackSpeed: 1500 },

    attackEnemy: () =>
        set((state) => {
            const newHp = state.enemy.hp - state.player.attack;
            return {
                enemy:
                    newHp <= 0
                        ? { hp: 20, maxHp: 20, attack: 3, attackSpeed: 1500 } // 적 리스폰
                        : { ...state.enemy, hp: newHp },
            };
        }),

    attackPlayer: () =>
        set((state) => {
            const newHp = state.player.hp - state.enemy.attack;
            return {
                player:
                    newHp <= 0
                        ? { ...state.player, hp: state.player.maxHp } // 플레이어 체력 회복
                        : { ...state.player, hp: newHp },
            };
        }),

    respawnEnemy: () =>
        set(() => ({
            enemy: { hp: 20, maxHp: 20, attack: 3, attackSpeed: 1500 },
        })),

    resetPlayer: () =>
        set((state) => ({
            player: { ...state.player, hp: state.player.maxHp },
        })),
}));
