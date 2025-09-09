import { useBattleStore } from "./zuct";

export default function InventoryUI() {
    const { inventory, addItem, removeItem } = useBattleStore();

    return (
        <div>
            <h3>인벤토리</h3>
            <ul>
                {inventory.map((item) => (
                    <li key={item.id}>
                        {item.name} x {item.quantity}
                        <button onClick={() => removeItem(item.id)}>사용</button>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => addItem({ id: "potion", name: "포션", type: "sub" }, 1)}
            >
                포션 추가
            </button>
        </div>
    );
}
