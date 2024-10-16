import { assert } from "chai";
import curve from "../src/index.js";
import { curve as _curve } from "../src/curve.js";
import { PoolTemplate } from "../src/pools/index.js";
import { BN } from "../src/utils.js";
import { IDict } from "../src/interfaces.js";

const PLAIN_POOLS = ['susd', 'ren', 'sbtc', 'hbtc', '3pool', 'seth', 'eurs', 'steth', 'ankreth', 'link', 'reth', 'eurt', '2pool', '4pool', 'fraxusdc', 'frxeth', 'sbtc2', 'fraxusdp', 'wbeth'];
const LENDING_POOLS = ['compound', 'usdt', 'y', 'busd', 'pax', 'aave', 'saave', 'ib'];
const META_POOLS = ['gusd', 'husd', 'usdk', 'usdn', 'musd', 'rsv', 'tbtc', 'dusd', 'pbtc', 'bbtc', 'usdp', 'tusd', 'frax', 'lusd', 'busdv2', 'alusd', 'mim'];
const CRYPTO_POOLS = ['tricrypto2', 'eurtusd', 'eursusd', 'crveth', 'cvxeth', 'xautusd', 'spelleth', 'teth', 'euroc'];
const FACTORY_PLAIN_POOLS = ['factory-v2-3', 'factory-v2-57', 'factory-v2-7']; // ['ibEUR+sEUR-f(2)', 'D3-f', 'crvCRV-f'];
const FACTORY_META_POOLS = ['factory-v2-84', 'factory-v2-80', 'factory-v2-60', 'factory-v2-136']; // ['baoUSD-3CRV-f', 'ELONXSWAP3CRV-f', 'ibbtc/sbtcCRV-f(2)', 'sUSDFRAXBP'];
const FACTORY_CRVUSD_POOLS = ['factory-crvusd-0', 'factory-crvusd-1', 'factory-crvusd-2', 'factory-crvusd-3'];
const FACTORY_CRYPTO_POOLS = ['factory-crypto-8', 'factory-crypto-4']; // ['YFIETH-fV2', 'BADGERWBTC-fV2'];
const FACTORY_CRYPTO_META_POOLS = ['factory-crypto-116', 'factory-crypto-97']; // ['DCHF/3CRV', 'cvxCrv/FraxBP'];
const FACTORY_TRICRYPTO_POOLS = ['factory-tricrypto-0', 'factory-tricrypto-1']; // ['crvUSDCWBTCWETH', 'crvUSDTWBTCWETH']
const ETHEREUM_POOLS = [...PLAIN_POOLS, ...LENDING_POOLS, ...META_POOLS, ...CRYPTO_POOLS];
// const ETHEREUM_POOLS = [...FACTORY_PLAIN_POOLS, ...FACTORY_META_POOLS, ...FACTORY_CRYPTO_POOLS, ...FACTORY_CRYPTO_META_POOLS];
// const ETHEREUM_POOLS = ['susd', '3pool', 'compound', 'aave', 'ib', 'gusd', 'mim', 'tricrypto2', 'crveth'];


const POLYGON_MAIN_POOLS = ['aave', 'ren', 'atricrypto3', 'eurtusd', 'eursusd'];
const POLYGON_FACTORY_PLAIN_POOLS = ['factory-v2-113', 'factory-v2-4', 'factory-v2-37']; // ['CRVALRTO-f', '3EUR-f', '4eur-f(2)'];
const POLYGON_FACTORY_META_POOLS = ['factory-v2-11']; // ['FRAX3CRV-f3CRV-f'];
const POLYGON_FACTORY_CRYPTO_META_POOLS = ['factory-crypto-1', 'factory-crypto-83']; // ['CRV/TRICRYPTO', 'WMATIC/TRICRYPTO'];
const POLYGON_POOLS = [...POLYGON_MAIN_POOLS, ...POLYGON_FACTORY_PLAIN_POOLS, ...POLYGON_FACTORY_META_POOLS, ...POLYGON_FACTORY_CRYPTO_META_POOLS];

const AVALANCHE_MAIN_POOLS = ['aave', 'ren', 'atricrypto', 'aaveV3', 'avaxcrypto'];
const AVALANCHE_FACTORY_PLAIN_POOLS = ['factory-v2-30', 'factory-v2-4']; // ['USD Coin', '3poolV2'];
const AVALANCHE_FACTORY_META_POOLS = ['factory-v2-0']; // ['MIM'];
const AVALANCHE_POOLS = [...AVALANCHE_MAIN_POOLS, ...AVALANCHE_FACTORY_PLAIN_POOLS, ...AVALANCHE_FACTORY_META_POOLS];

const FANTOM_MAIN_POOLS = ['2pool', 'fusdt', 'ren', 'tricrypto', 'ib', 'geist'];
const FANTOM_FACTORY_PLAIN_POOLS = ['factory-v2-85', 'factory-v2-1', 'factory-v2-7']; // ['axlUSDC/USDC', '3poolV2', '4pool'];
const FANTOM_FACTORY_META_POOLS = ['factory-v2-16', 'factory-v2-40']; // ['FRAX2pool', 'Geist Frax'];
const FANTOM_FACTORY_CRYPTO_POOLS = ['factory-crypto-3']; // ['aCRV/CRV'];
const FANTOM_POOLS = [...FANTOM_MAIN_POOLS, ...FANTOM_FACTORY_PLAIN_POOLS, ...FANTOM_FACTORY_META_POOLS, ...FANTOM_FACTORY_CRYPTO_POOLS];

const ARBITRUM_MAIN_POOLS = ['2pool', 'tricrypto', 'ren', 'eursusd', 'wsteth'];
const ARBITRUM_FACTORY_PLAIN_POOLS = ['factory-v2-15', 'factory-v2-29']; // ['deBridge-ETH', 'Aave aDAI+aUSC+aUSDT USDFACTORY'];
const ARBITRUM_FACTORY_META_POOLS = ['factory-v2-0']; // ['MIM'];
const ARBITRUM_POOLS = [...ARBITRUM_MAIN_POOLS, ...ARBITRUM_FACTORY_PLAIN_POOLS, ...ARBITRUM_FACTORY_META_POOLS];

const OPTIMISM_MAIN_POOLS = ['3pool', 'wsteth'];
const OPTIMISM_FACTORY_PLAIN_POOLS = ['factory-v2-10']; // ['sETH/ETH'];
const OPTIMISM_FACTORY_META_POOLS = ['factory-v2-0']; // ['sUSD Synthetix'];
const OPTIMISM_POOLS = [...OPTIMISM_MAIN_POOLS, ...OPTIMISM_FACTORY_PLAIN_POOLS, ...OPTIMISM_FACTORY_META_POOLS];

const XDAI_MAIN_POOLS = ['3pool', 'rai', 'tricrypto', 'eureusd'];
const XDAI_FACTORY_PLAIN_POOLS = ['factory-v2-0']; // ['sGNO/GNO'];
const XDAI_FACTORY_META_POOLS = ['factory-v2-4']; // ['MAI Stablecoin'];
const XDAI_POOLS = [...XDAI_MAIN_POOLS, ...XDAI_FACTORY_PLAIN_POOLS, ...XDAI_FACTORY_META_POOLS];

const MOONBEAM_MAIN_POOLS = ['3pool'];
const MOONBEAM_FACTORY_PLAIN_POOLS = ['factory-v2-6']; // ['DAI Multi Nomad'];
const MOONBEAM_POOLS = [...MOONBEAM_MAIN_POOLS, ...MOONBEAM_FACTORY_PLAIN_POOLS];

const AURORA_POOLS = ['3pool'];

const KAVA_POOLS = ['factory-v2-0'];

const CELO_POOLS = ['factory-v2-0'];

// ------------------------------------------

const POOLS_FOR_TESTING = FACTORY_TRICRYPTO_POOLS;

const underlyingLiquidityTest = (id: string) => {
    describe(`${id} deposit-stake-deposit&stake-unstake-withdraw`, function () {
        let pool: PoolTemplate;
        let coinAddresses: string[];
        let amounts: string[];

        before(async function () {
            pool = curve.getPool(id);
            coinAddresses = pool.underlyingCoinAddresses;
            amounts = await pool.stats.underlyingBalances();
            amounts = amounts.map((a, i) => BN(a).div(10).lte(1) ? BN(a).div(10).toFixed(pool.underlyingDecimals[i]) : '1');
        });

        it('Deposit', async function () {
            if (id === 'factory-v2-7' && curve.chainId === 1) amounts[3] = '0';
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenExpected = await pool.depositExpected(amounts);

            coinAddresses.forEach((c, i) => {
                if (Number(initialBalances[c]) === 0) throw Error(`${pool.underlyingCoins[i]} balance = 0`);
            })

            await pool.deposit(amounts);

            const balances = await pool.wallet.balances() as IDict<string>;

            coinAddresses.forEach((c, i) => {
                if (id === 'steth' || pool.id === 'factory-v2-8') {
                    assert.approximately(Number(balances[c]), Number(BN(initialBalances[c]).minus(BN(amounts[i]).toFixed())), 1e-18, `Coin address: ${c}`);
                } else {
                    assert.deepStrictEqual(BN(balances[c]), BN(initialBalances[c]).minus(BN(amounts[i])), `Coin address: ${c}`);
                }
            })

            const delta = ['factory-v2-80', 'factory-v2-113'].includes(id) ? 2 : ['factory-v2-10'].includes(id) && curve.chainId === 10 ? 0.1 : 0.01
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
            if (pool.gauge.address === _curve.constants.ZERO_ADDRESS) {
                console.log('Skip');
                return;
            }

            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenExpected = await pool.depositAndStakeExpected(amounts);

            coinAddresses.forEach((c, i) => {
                if (Number(initialBalances[c]) === 0) throw Error(`${pool.underlyingCoins[i]} balance = 0`);
            })

            await pool.depositAndStake(amounts);

            const balances = await pool.wallet.balances() as IDict<string>;
            coinAddresses.forEach((c, i) => {
                if (id === 'steth') {
                    assert.approximately(Number(balances[c]), Number(BN(initialBalances[c]).minus(BN(amounts[i]).toString())), 1e-18, `Coin address: ${c}`);
                } else {
                    assert.deepStrictEqual(BN(balances[c]), BN(initialBalances[c]).minus(BN(amounts[i])), `Coin address: ${c}`);
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
            const coinsExpected = await pool.withdrawExpected(lpTokenAmount);

            await pool.withdraw(lpTokenAmount);

            const balances = await pool.wallet.balances() as IDict<string>;

            assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)));
            coinAddresses.forEach((c: string, i: number) => {
                const delta = ['gusd', 'factory-v2-37'].includes(id) ? 0.011 : ['factory-v2-80'].includes(id) ? 1 : ['factory-crypto-83'].includes(id) ? 0.1 : 0.01;
                assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(coinsExpected[i]), delta, c);
            })
        });

        it('Withdraw imbalance', async function () {
            if (pool.isCrypto) {
                console.log("No such method")
            } else {
                const withdrawAmounts = amounts.map((a, i) => BN(a).div(10).toFixed(pool.underlyingDecimals[i]));
                if (id === "factory-v2-7") withdrawAmounts[3] = '0.1';
                const initialBalances = await pool.wallet.balances() as IDict<string>;
                const lpTokenExpected = await pool.withdrawImbalanceExpected(withdrawAmounts);

                await pool.withdrawImbalance(withdrawAmounts, 2);

                const balances = await pool.wallet.balances() as IDict<string>;
                const delta = ['factory-v2-80', 'factory-v2-113'].includes(id) ? 2 : 0.01
                assert.approximately(Number(initialBalances.lpToken) - Number(balances.lpToken), Number(lpTokenExpected), delta);
                coinAddresses.forEach((c, i) => {
                    if (id === 'steth') {
                        assert.approximately(Number(initialBalances[c]), Number(BN(balances[c]).minus(BN(withdrawAmounts[i])).toString()), 1e-18);
                    } else if (['compound', 'usdt', 'y', 'busd', 'pax', 'ib'].includes(pool.id)) {
                        assert.approximately(Number(initialBalances[c]), Number(BN(balances[c]).minus(BN(withdrawAmounts[i])).toString()), 3e-6);
                    } else {
                        assert.deepStrictEqual(BN(initialBalances[c]), BN(balances[c]).minus(BN(withdrawAmounts[i])));
                    }
                });
            }
        });

        it('Withdraw one coin', async function () {
            const initialBalances = await pool.wallet.balances() as IDict<string>;
            const lpTokenAmount: string = BN(initialBalances.lpToken).div(10).toFixed(18);
            const expected = await pool.withdrawOneCoinExpected(lpTokenAmount, 0);

            await pool.withdrawOneCoin(lpTokenAmount, 0);

            const balances = await pool.wallet.balances() as IDict<string>;

            assert.deepStrictEqual(BN(balances.lpToken), BN(initialBalances.lpToken).minus(BN(lpTokenAmount)), "LP");
            coinAddresses.forEach((c: string, i: number) => {
                if (i === 0) {
                    assert.approximately(Number(balances[c]) - Number(initialBalances[c]), Number(expected), 0.01, `Coin address: ${c}`)
                } else {
                    assert.strictEqual(balances[c], initialBalances[c], `Coin address: ${c}`);
                }
            })
        });
    });
}

const underlyingSwapTest = (id: string) => {
    describe(`${id} exchange`, function () {
        let pool: PoolTemplate;
        let coinAddresses: string[];
        let amounts: string[];

        before(async function () {
            pool = curve.getPool(id);
            coinAddresses = pool.underlyingCoinAddresses;
            amounts = await pool.stats.underlyingBalances();
            amounts = amounts.map((a, i) => BN(a).div(10).lte(1) ? BN(a).div(10).toFixed(pool.underlyingDecimals[i]) : '1');
        });

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (i !== j) {
                    it(`${i} --> ${j}`, async function () {
                        if (i >= coinAddresses.length || j >= coinAddresses.length || (id === "factory-v2-7" && i === 3)) {
                            console.log('Skip')
                        } else {
                            const swapAmount = amounts[i];
                            const initialCoinBalances = await pool.wallet.underlyingCoinBalances() as IDict<string>;
                            const expected = await pool.swapExpected(i, j, swapAmount);

                            await pool.swap(i, j, swapAmount, 0.05);

                            const coinBalances = await pool.wallet.underlyingCoinBalances() as IDict<string>;

                            if (pool.id === 'steth' || pool.id === 'factory-v2-60') {
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

describe('Underlying test', async function () {
    this.timeout(120000);

    before(async function () {
        await curve.init('JsonRpc', {},{ gasPrice: 0 });
        await curve.factory.fetchPools();
        await curve.crvUSDFactory.fetchPools();
        await curve.cryptoFactory.fetchPools();
        await curve.tricryptoFactory.fetchPools();
    });

    for (const poolId of POOLS_FOR_TESTING) {
        underlyingLiquidityTest(poolId);
        underlyingSwapTest(poolId);
    }
})
