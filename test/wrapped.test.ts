import { assert } from "chai";
import curve from "../src/index.js";
import { curve as _curve } from "../src/curve.js";
import { BN } from "../src/utils.js";
import { IDict } from "../src/interfaces.js";
import { PoolTemplate } from "../src/pools/index.js";

const LENDING_POOLS = ['compound', 'usdt', 'y', 'busd', 'pax', 'aave', 'saave', 'ib'];
const META_POOLS = ['gusd', 'husd', 'usdk', 'usdn', 'musd', 'rsv', 'tbtc', 'dusd', 'pbtc', 'bbtc', 'ust', 'usdp', 'tusd', 'frax', 'lusd', 'busdv2', 'alusd', 'mim'];
const CRYPTO_POOLS = ['tricrypto2', 'eurtusd', 'crveth', 'cvxeth', 'xautusd', 'spelleth', 'teth', 'euroc'];
const FACTORY_META_POOLS = ['factory-v2-84', 'factory-v2-80', 'factory-v2-60', 'factory-v2-136']; // ['baoUSD-3CRV-f', 'ELONXSWAP3CRV-f', 'ibbtc/sbtcCRV-f(2)', 'sUSDFRAXBP'];
const FACTORY_CRYPTO_POOLS = ['factory-crypto-8']; // ['YFIETH-fV2'];
const FACTORY_CRYPTO_META_POOLS = ['factory-crypto-116', 'factory-crypto-97']; // ['DCHF/3CRV', 'cvxCrv/FraxBP'];
const FACTORY_TRICRYPTO_POOLS = ['factory-tricrypto-0', 'factory-tricrypto-1']; // ['crvUSDCWBTCWETH', 'crvUSDTWBTCWETH']
// const ETHEREUM_POOLS = [...LENDING_POOLS, ...META_POOLS, ...CRYPTO_POOLS];
// const ETHEREUM_POOLS = [...FACTORY_META_POOLS, ...FACTORY_CRYPTO_POOLS];
const ETHEREUM_POOLS = ['factory-v2-136']//['compound', 'aave', 'ib', 'gusd', 'mim', 'tricrypto2', 'crveth'];

const POLYGON_MAIN_POOLS = ['aave', 'ren', 'eurtusd', 'eursusd'];
const POLYGON_FACTORY_META_POOLS = ['factory-v2-11']; // ['FRAX3CRV-f3CRV-f'];
const POLYGON_FACTORY_CRYPTO_META_POOLS = ['factory-crypto-1', 'factory-crypto-83']; // ['CRV/TRICRYPTO', 'WMATIC/TRICRYPTO'];
const POLYGON_POOLS = ['eursusd'];

const AVALANCHE_MAIN_POOLS = ['aave', 'ren', 'aaveV3', 'avaxcrypto'];
const AVALANCHE_FACTORY_META_POOLS = ['factory-v2-0']; // ['MIM'];
const AVALANCHE_POOLS = AVALANCHE_FACTORY_META_POOLS;

const ARBITRUM_MAIN_POOLS = ['tricrypto', 'eursusd'];
const ARBITRUM_FACTORY_META_POOLS = ['factory-v2-0']; // ['MIM'];
const ARBITRUM_POOLS = [...ARBITRUM_MAIN_POOLS, ...ARBITRUM_FACTORY_META_POOLS];

const OPTIMISM_FACTORY_META_POOLS = ['factory-v2-0']; // ['sUSD Synthetix'];
const OPTIMISM_POOLS = [...OPTIMISM_FACTORY_META_POOLS];

const XDAI_MAIN_POOLS = ['rai', 'tricrypto', 'eureusd'];
const XDAI_FACTORY_META_POOLS = ['factory-v2-4']; // ['MAI Stablecoin'];
const XDAI_POOLS = [...XDAI_MAIN_POOLS, ...XDAI_FACTORY_META_POOLS];

const FANTOM_MAIN_POOLS = ['fusdt', 'ib', 'geist'];
const FANTOM_FACTORY_META_POOLS = ['factory-v2-16', 'factory-v2-40']; // ['FRAX2pool', 'Geist Frax'];
const FANTOM_POOLS = [...FANTOM_MAIN_POOLS, ...FANTOM_FACTORY_META_POOLS];

// ------------------------------------------

const POOLS_FOR_TESTING = FACTORY_TRICRYPTO_POOLS;

const AAVE_POOLS = ['aave', 'saave', 'geist', 'aaveV3'];

const wrappedLiquidityTest = (id: string) => {
    describe(`${id} deposit-stake--deposit&stake-unstake-withdraw`, function () {
        let pool: PoolTemplate;
        let coinAddresses: string[];
        let amounts: string[];

        before(async function () {
            pool = curve.getPool(id);
            coinAddresses = pool.wrappedCoinAddresses;
            amounts = await pool.stats.wrappedBalances();
            amounts = amounts.map((a, i) => BN(a).div(10).lte(1) ? BN(a).div(10).toFixed(pool.wrappedDecimals[i]) : '1');
        });

        it('Deposit', async function () {
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenExpected = await pool.depositWrappedExpected(amounts)

            coinAddresses.forEach((c, i) => {
                if (Number(initialBalances[c]) === 0) throw Error(`${pool.wrappedCoins[i]} balance = 0`);
            })

            await pool.depositWrapped(amounts);

            const balances = await pool.wallet.balances() as IDict<string>;
            coinAddresses.forEach((c, i) => {
                if (AAVE_POOLS.includes(id) || (pool.isLending && pool.id === 'ren')) {
                    // Because of increasing quantity
                    assert.approximately(Number(balances[c]), Number(BN(initialBalances[c]).minus(BN(amounts[i]).toString())), 1e-2);
                } else if (pool.id === 'factory-v2-60') {
                    assert.approximately(Number(balances[c]), Number(BN(initialBalances[c]).minus(BN(amounts[i]).toString())), 1e-18);
                } else {
                    assert.deepStrictEqual(BN(balances[c]), BN(initialBalances[c]).minus(BN(amounts[i])));
                }
            })
            const delta = id === 'factory-v2-80' ? 2 : 0.01
            assert.approximately(Number(balances.lpToken) - Number(initialBalances.lpToken), Number(lpTokenExpected), delta);
        });

        it('Stake', async function () {
            if (pool.gauge.address === _curve.constants.ZERO_ADDRESS) {
                console.log('Skip');
                return
            }

            const depositAmount: string = (await pool.wallet.lpTokenBalances() as IDict<string>).lpToken;

            await pool.stake(depositAmount);

            const balances = await pool.wallet.lpTokenBalances();

            assert.strictEqual(depositAmount, balances.gauge);
            assert.strictEqual(Number(balances.lpToken), 0);
        });

        it('Deposit&stake', async function () {
            if (pool.isPlain || pool.isFake || pool.gauge.address === _curve.constants.ZERO_ADDRESS) {
                console.log('Skip');
                return;
            }

            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenExpected = await pool.depositAndStakeWrappedExpected(amounts);

            coinAddresses.forEach((c, i) => {
                if (Number(initialBalances[c]) === 0) throw Error(`${pool.wrappedCoins[i]} balance = 0`);
            })

            await pool.depositAndStakeWrapped(amounts);

            const balances = await pool.wallet.balances() as IDict<string>;
            coinAddresses.forEach((c, i) => {
                if (AAVE_POOLS.includes(id) || (pool.isLending && pool.id === 'ren')) {
                    assert.approximately(Number(balances[c]), Number(BN(initialBalances[c]).minus(BN(amounts[i]).toString())), 1e-2);
                } else {
                    assert.deepStrictEqual(BN(balances[c]), BN(initialBalances[c]).minus(BN(amounts[i])));
                }
            })
            assert.approximately(Number(balances.gauge) - Number(initialBalances.gauge), Number(lpTokenExpected), 0.01);
            assert.strictEqual(Number(balances.lpToken) - Number(initialBalances.lpToken), 0);
        });

        it('Unstake', async function () {
            if (pool.gauge.address === _curve.constants.ZERO_ADDRESS) {
                console.log('Skip');
                return
            }

            const withdrawAmount: string = (await pool.wallet.lpTokenBalances() as IDict<string>).gauge;

            await pool.unstake(withdrawAmount);

            const balances = await pool.wallet.lpTokenBalances();

            assert.strictEqual(withdrawAmount, balances.lpToken);
            assert.strictEqual(Number(balances.gauge), 0);
        });

        it('Withdraw', async function () {
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenAmount: string = BN(initialBalances.lpToken).div(10).toFixed(18);
            const coinsExpected = await pool.withdrawWrappedExpected(lpTokenAmount);

            await pool.withdrawWrapped(lpTokenAmount, 1);

            const balances = await pool.wallet.balances() as IDict<string>;

            assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)));
            coinAddresses.forEach((c: string, i: number) => {
                const delta = id == 'gusd' ? 0.011 : id === 'factory-v2-80' ? 2 : 0.01
                assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(coinsExpected[i]), delta);
            });
        });

        it('Withdraw imbalance', async function () {
            if (pool.isCrypto) {
                console.log("No such method")
            } else {
                const withdrawAmounts = amounts.map((a, i) => BN(a).div(10).toFixed(pool.underlyingDecimals[i]));
                const initialBalances = await pool.wallet.balances() as IDict<string>;
                const lpTokenExpected = await pool.withdrawImbalanceWrappedExpected(withdrawAmounts);

                await pool.withdrawImbalanceWrapped(withdrawAmounts);

                const balances = await pool.wallet.balances() as IDict<string>;

                const delta = id === 'factory-v2-80' ? 2 : 0.01
                assert.approximately(Number(initialBalances.lpToken) - Number(balances.lpToken), Number(lpTokenExpected), delta);
                coinAddresses.forEach((c, i) => {
                    if (AAVE_POOLS.includes(id) || (pool.isLending && pool.id === 'ren')) {
                        assert.approximately(Number(initialBalances[c]), Number(BN(balances[c]).minus(BN(withdrawAmounts[i])).toString()), 1e-4);
                    } else {
                        assert.deepStrictEqual(BN(initialBalances[c]), BN(balances[c]).minus(BN(withdrawAmounts[i])));
                    }
                });
            }
        });

        if (!['compound', 'usdt', 'y', 'busd', 'pax'].includes(id)) {
            it('Withdraw one coin', async function () {
                const initialBalances = await pool.wallet.balances() as IDict<string>;
                const lpTokenAmount: string = BN(initialBalances.lpToken).div(10).toFixed(18);
                const expected = await pool.withdrawOneCoinWrappedExpected(lpTokenAmount, 0);

                await pool.withdrawOneCoinWrapped(lpTokenAmount, 0);

                const balances = await pool.wallet.balances() as IDict<string>;

                assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)));
                coinAddresses.forEach((c: string, i: number) => {
                    if (i === 0) {
                        assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(expected), 0.01);
                    } else {
                        if (AAVE_POOLS.includes(id)  || (pool.isLending && pool.id === 'ren')) {
                            // Because of increasing quantity
                            assert.approximately(Number(balances[c]), Number(initialBalances[c]), 1e-4);
                        } else {
                            assert.strictEqual(balances[c], initialBalances[c]);
                        }
                    }
                })
            });
        }
    });
}

const wrappedSwapTest = (id: string) => {
    describe(`${id} exchange`, function () {
        let pool: PoolTemplate;
        let coinAddresses: string[];
        let amounts: string[];

        before(async function () {
            pool = curve.getPool(id);
            coinAddresses = pool.wrappedCoinAddresses;
            amounts = await pool.stats.wrappedBalances();
            amounts = amounts.map((a, i) => BN(a).div(10).lte(1) ? BN(a).div(10).toFixed(pool.wrappedDecimals[i]) : '1');
        });

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (i !== j) {
                    it(`${i} --> ${j}`, async function () {
                        if (i >= coinAddresses.length || j >= coinAddresses.length) {
                            console.log('Skip')
                        } else {
                            const swapAmount = amounts[i];
                            const initialCoinBalances = await pool.wallet.wrappedCoinBalances() as IDict<string>;
                            const expected = await pool.swapWrappedExpected(i, j, swapAmount);

                            await pool.swapWrapped(i, j, swapAmount, 0.02);

                            const coinBalances = await pool.wallet.wrappedCoinBalances() as IDict<string>;

                            if (AAVE_POOLS.includes(pool.id) || (pool.isLending && pool.id === 'ren')) {
                                // Because of increasing quantity
                                assert.approximately(Number(Object.values(coinBalances)[i]), Number(BN(Object.values(initialCoinBalances)[i]).minus(BN(swapAmount).toString())), 1e-2);
                            } else if (pool.id === 'factory-v2-60') {
                                assert.approximately(Number(Object.values(coinBalances)[i]), Number(BN(Object.values(initialCoinBalances)[i]).minus(BN(swapAmount)).toString()), 1e-18);
                            } else {
                                assert.deepStrictEqual(BN(Object.values(coinBalances)[i]), BN(Object.values(initialCoinBalances)[i]).minus(BN(swapAmount)));
                            }
                            assert.isAtLeast(Number(Object.values(coinBalances)[j]), Number(BN(Object.values(initialCoinBalances)[j]).plus(BN(expected).times(0.98)).toString()));
                        }
                    });
                }
            }
        }
    });
}

describe('Wrapped test', async function () {
    this.timeout(120000);

    before(async function () {
        await curve.init('JsonRpc', {}, { gasPrice: 0 });
        await curve.factory.fetchPools();
        await curve.cryptoFactory.fetchPools();
        await curve.tricryptoFactory.fetchPools();
    });


    for (const poolId of POOLS_FOR_TESTING) {
        wrappedLiquidityTest(poolId);
        wrappedSwapTest(poolId);
    }
})
