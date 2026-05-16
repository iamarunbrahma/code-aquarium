import * as assert from 'assert';
import {
    FishSpecification,
    KEY_AGE,
    KEY_COLORS,
    KEY_ENERGY,
    KEY_HAPPINESS,
    KEY_HUNGER,
    KEY_NAMES,
    KEY_SPECIES,
    storeCollectionAsMemento,
} from '../../extension/persistence';
import { FishColor, FishSize, FishSpecies } from '../../common/types';

/**
 * In-memory replacement for vscode.ExtensionContext.globalState.
 * Only the surface that storeCollectionAsMemento touches is implemented.
 */
class MemMemento {
    private store = new Map<string, unknown>();
    public syncKeys: string[] = [];

    get<T>(key: string, fallback: T): T {
        if (this.store.has(key)) {
            return this.store.get(key) as T;
        }
        return fallback;
    }
    async update(key: string, value: unknown): Promise<void> {
        this.store.set(key, value);
    }
    setKeysForSync(keys: string[]): void {
        this.syncKeys = [...keys];
    }
}

function mockContext(): { globalState: MemMemento } {
    return { globalState: new MemMemento() };
}

suite('FishSpecification persistence', () => {
    test('round-trips a collection through the memento losslessly', async () => {
        const ctx = mockContext() as unknown as {
            globalState: MemMemento;
        };
        const original: FishSpecification[] = [
            new FishSpecification(
                FishSpecies.goldfish,
                FishColor.orange,
                FishSize.small,
                'Bubbles',
                65,
                72,
                88,
                512,
            ),
            new FishSpecification(
                FishSpecies.tropical,
                FishColor.blue,
                FishSize.small,
                'Reef',
                40,
                90,
                50,
                1024,
            ),
            new FishSpecification(
                FishSpecies.shark,
                FishColor.gray,
                FishSize.small,
                'Bruce',
                30,
                60,
                70,
                256,
            ),
        ];

        await storeCollectionAsMemento(
            ctx as unknown as import('vscode').ExtensionContext,
            original,
        );

        const restored = FishSpecification.collectionFromMemento(
            ctx as unknown as import('vscode').ExtensionContext,
            FishSize.small,
        );

        assert.strictEqual(restored.length, original.length);
        for (let i = 0; i < original.length; i++) {
            assert.strictEqual(restored[i].species, original[i].species);
            assert.strictEqual(restored[i].color, original[i].color);
            assert.strictEqual(restored[i].name, original[i].name);
            assert.strictEqual(restored[i].hunger, original[i].hunger);
            assert.strictEqual(restored[i].happiness, original[i].happiness);
            assert.strictEqual(restored[i].energy, original[i].energy);
            assert.strictEqual(restored[i].age, original[i].age);
        }
    });

    test('persists denormalized parallel arrays of equal length', async () => {
        const ctx = mockContext();
        const collection = [
            new FishSpecification(
                FishSpecies.crab,
                FishColor.red,
                FishSize.small,
                'Pinch',
            ),
            new FishSpecification(
                FishSpecies.octopus,
                FishColor.pink,
                FishSize.small,
                'Eight',
            ),
        ];
        await storeCollectionAsMemento(
            ctx as unknown as import('vscode').ExtensionContext,
            collection,
        );
        const keys = [
            KEY_SPECIES,
            KEY_COLORS,
            KEY_NAMES,
            KEY_HUNGER,
            KEY_HAPPINESS,
            KEY_ENERGY,
            KEY_AGE,
        ];
        for (const key of keys) {
            const arr = ctx.globalState.get<unknown[]>(key, []);
            assert.strictEqual(
                arr.length,
                collection.length,
                `parallel array ${key} has wrong length`,
            );
        }
    });

    test('limits cross-device sync to identity arrays plus achievements', async () => {
        const ctx = mockContext();
        await storeCollectionAsMemento(
            ctx as unknown as import('vscode').ExtensionContext,
            [
                new FishSpecification(
                    FishSpecies.goldfish,
                    FishColor.orange,
                    FishSize.small,
                ),
            ],
        );
        const synced = ctx.globalState.syncKeys.sort();
        assert.deepStrictEqual(synced, [
            'codeAquarium.achievements',
            'codeAquarium.fish.colors',
            'codeAquarium.fish.names',
            'codeAquarium.fish.species',
        ]);
    });

    test('normalizes mismatched color to a species-valid one', () => {
        const f = new FishSpecification(
            FishSpecies.shark,
            FishColor.pink, // pink is not a valid shark color
            FishSize.small,
            'Bruce',
        );
        // Pink falls back to the first available shark color (gray).
        assert.notStrictEqual(f.color, FishColor.pink);
    });
});
