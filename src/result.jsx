import { useContext } from 'react';
import { GlobalStateContext, SchemeDataSetterContext, UiSettingsSetterContext } from './contexts';

/** 配方选项的展示格式，有空把它换成图形界面 */
export function RecipeSelect({ item, choice, onChange }) {
    const global_state = useContext(GlobalStateContext);

    function recipe_label_text(recipe) {
        var str = "";
        var num = 0;
        for (var material in recipe["原料"]) {
            if (num != 0) {
                str += " + ";
            }
            str += recipe["原料"][material] + " * " + material;
            num += 1;
        }
        if (num != 0) {
            str += "→";
        }
        num = 0;
        for (var products in recipe["产物"]) {
            if (num != 0) {
                str += " + ";
            }
            str += recipe["产物"][products] + " * " + products;
            num += 1;
        }
        str += "    耗时:" + recipe["时间"] + "s";
        return str;
    }

    let game_data = global_state.game_data;
    let item_data = global_state.item_data;

    let option_doms = [];
    for (let i = 1; i < item_data[item].length; i++) {
        let recipe_index = item_data[item][i];
        let recipe = game_data.recipe_data[recipe_index];
        option_doms.push(<option key={i} value={i}>{recipe_label_text(recipe)}</option>);
    }

    return <select value={choice} onChange={onChange}>{option_doms}</select>;
}

export function ProNumSelect({ choice, onChange }) {
    const global_state = useContext(GlobalStateContext);
    let game_data = global_state.game_data;

    let pro_nums = [];
    for (var i = 0; i < game_data.proliferate_effect.length; i++) {
        if (global_state.proliferator_price[i] != -1)
            pro_nums.push(i);
    }
    let option_doms = [];
    for (let pro_num of pro_nums) {
        option_doms.push(<option key={pro_num} value={pro_num}>{pro_num}</option>)
    }

    return <select value={choice} onChange={onChange}>{option_doms}</select>;
}

export const pro_mode_lists = {
    [0]: { [0]: "不使用增产剂" },
    [1]: { [0]: "不使用增产剂", [1]: "增产" },
    [2]: { [0]: "不使用增产剂", [2]: "加速" },
    [3]: { [0]: "不使用增产剂", [1]: "增产", [2]: "加速" },
    [4]: { [0]: "不使用增产剂", [4]: "接收站透镜喷涂" },
}

export function ProModeSelect({ recipe_id, choice, onChange }) {
    const global_state = useContext(GlobalStateContext);
    let game_data = global_state.game_data;

    let pro_mode_list = pro_mode_lists[game_data.recipe_data[recipe_id]["增产"]];
    let option_doms = Object.entries(pro_mode_list).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
    ));

    return <select value={choice} onChange={onChange}>{option_doms}</select>;
}

export function FactorySelect({ recipe_id, choice, onChange }) {
    const global_state = useContext(GlobalStateContext);
    let game_data = global_state.game_data;

    let factory_kind = game_data.recipe_data[recipe_id]["设施"];
    let factory_list = game_data.factory_data[factory_kind];

    let option_doms = Object.entries(factory_list).map(([factory, factory_data]) => {
        let factory_name = factory_data["名称"];
        return <option key={factory} value={factory}>{factory_name}</option>
    });

    return <select value={choice} onChange={onChange}>{option_doms}</select>;

}

export function Result({ needs_list }) {
    const global_state = useContext(GlobalStateContext);
    const set_scheme_data = useContext(SchemeDataSetterContext);
    const set_ui_settings = useContext(UiSettingsSetterContext);

    // const [result_dict, set_result_dict] = useState(global_state.calculate());
    let game_data = global_state.game_data;
    let scheme_data = global_state.scheme_data;
    let item_data = global_state.item_data;
    let item_graph = global_state.item_graph;
    let time_tick = global_state.ui_settings.is_time_unit_minute ? 60 : 1;

    // TODO refactor to a simple list
    let mineralize_list = global_state.ui_settings.mineralize_list;
    let natural_production_line = global_state.ui_settings.natural_production_line;
    console.log("result natural_production_line", natural_production_line);

    console.log("CALCULATING");
    let [result_dict, lp_surplus_list] = global_state.calculate(needs_list);
    console.log("lp_surplus_list", lp_surplus_list);

    // TODO fixed_num
    let fixed_num = 2;
    let energy_cost = 0;
    let building_list = {};
    function get_factory_number(amount, item) {
        var recipe_id = item_data[item][scheme_data.item_recipe_choices[item]];
        var scheme_for_recipe = scheme_data.scheme_for_recipe[recipe_id];
        var factory_per_yield = 1 / item_graph[item]["产出倍率"] / game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["倍率"];
        var offset = 0;
        offset = 0.49994 * 0.1 ** fixed_num;//未显示的部分进一法取整
        var build_number = amount / time_tick * factory_per_yield + offset;
        if (Math.ceil(build_number - 0.5 * 0.1 ** fixed_num) != 0) {
            if (game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["名称"] in building_list) {
                building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["名称"]] = Number(building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["名称"]]) + Math.ceil(build_number - 0.5 * 0.1 ** fixed_num);
            }
            else {
                building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["名称"]] = Math.ceil(build_number - 0.5 * 0.1 ** fixed_num);
            }
        } game_data.factory_data[""]
        var factory = game_data.recipe_data[recipe_id]["设施"];
        if (factory != "巨星采集" && !(!scheme_data.energy_contain_miner && (factory == "采矿设备" || factory == "抽水设备" || factory == "抽油设备"))) {
            var e_cost = build_number * game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["耗能"];
            if (game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_for_recipe["建筑"]]["名称"] == "大型采矿机") {
                e_cost = scheme_data.mining_rate["大矿机工作倍率"] * scheme_data.mining_rate["大矿机工作倍率"] * (2.94 - 0.168) + 0.168;
            }
            if (scheme_for_recipe["增产模式"] != 0 && scheme_for_recipe["喷涂点数"] != 0) {
                e_cost *= game_data.proliferate_effect[scheme_for_recipe["喷涂点数"]]["耗电倍率"];
            }
            energy_cost = Number(energy_cost) + e_cost;
        }
        return build_number;
    }
    function is_mineralized(item) {
        if (item in mineralize_list) {
            return "(原矿化)";
        }
        else {
            return "";
        }
    }
    function get_gross_output(amount, item) {
        var offset = 0;
        offset = 0.49994 * 0.1 ** fixed_num;//未显示的部分进一法取整
        if (item_graph[item]["自消耗"]) {
            return Number(amount * (1 + item_graph[item]["自消耗"])) + offset;
        }
        return Number(amount) + offset;
    }

    // Dict<item, Dict<from, quantity>>
    let side_products = {};
    Object.entries(result_dict).forEach(([item, item_count]) => {
        Object.entries(item_graph[item]["副产物"]).forEach(([side_product, amount]) => {
            side_products[side_product] = side_products[side_product] || {};
            side_products[side_product][item] = item_count * amount;
        });
    })

    function mineralize(item) {
        let new_mineralize_list = structuredClone(mineralize_list);
        new_mineralize_list[item] = structuredClone(item_graph[item]);
        // editing item_graph!
        item_graph[item]["原料"] = {};

        console.log("mineralize_list", new_mineralize_list);
        set_ui_settings("mineralize_list", new_mineralize_list);
    }

    function unmineralize(item) {
        let new_mineralize_list = structuredClone(mineralize_list);
        // editing item_graph!
        item_graph[item] = structuredClone(mineralize_list[item]);
        delete new_mineralize_list[item];
        set_ui_settings("mineralize_list", new_mineralize_list);
    }

    let mineralize_doms = Object.keys(mineralize_list).map(item => (
        <button key={item} onClick={() => unmineralize(item)}>{item}</button>
    ));

    let result_table_rows = [];
    for (let i in result_dict) {
        side_products[i] = side_products[i] || {};
        let total = result_dict[i] + Object.values(side_products[i]).reduce((a, b) => a + b, 0);
        if (total < 1e-6) continue;

        let recipe_id = item_data[i][scheme_data.item_recipe_choices[i]];
        let factory_number = get_factory_number(result_dict[i], i).toFixed(fixed_num);

        let from_side_products = Object.entries(side_products[i]).map(([from, amount]) =>
            // TODO apply [fixed_num]
            <div key={from}>+{amount} ({from})</div>
        );

        function change_recipe(e) {
            set_scheme_data(old_scheme_data => {
                let scheme_data = structuredClone(old_scheme_data);
                scheme_data.item_recipe_choices[i] = e.target.value;
                return scheme_data;
            })
        }

        function change_pro_num(e) {
            set_scheme_data(old_scheme_data => {
                let scheme_data = structuredClone(old_scheme_data);
                scheme_data.scheme_for_recipe[recipe_id]["喷涂点数"] = e.target.value;
                return scheme_data;
            })
        }

        function change_pro_mode(e) {
            set_scheme_data(old_scheme_data => {
                let scheme_data = structuredClone(old_scheme_data);
                scheme_data.scheme_for_recipe[recipe_id]["增产模式"] = e.target.value;
                return scheme_data;
            })
        }

        function change_factory(e) {
            set_scheme_data(old_scheme_data => {
                let scheme_data = structuredClone(old_scheme_data);
                scheme_data.scheme_for_recipe[recipe_id]["建筑"] = e.target.value;
                return scheme_data;
            })
        }

        result_table_rows.push(<tr key={i} id={`row_of_${i}`}>
            {/* 操作 */}
            <td><button className='btn btn-sm btn-outline-primary' onClick={() => mineralize(i)}>视为原矿</button></td>
            {/* 目标物品 */}
            <td><img src={`./image/${global_state.game_name}/${i}.png`} title={i} style={{ width: '40px', height: '40px' }} /></td>
            {/* 分钟毛产出 */}
            <td id={`num_of_${i}`}>
                <div>{get_gross_output(result_dict[i], i).toFixed(fixed_num)}</div>
                {from_side_products}
            </td>
            {/* 所需工厂*数目 */}
            <td><span id={`factory_counts_of_${i}`} value={factory_number}>{
                game_data.factory_data[game_data.recipe_data[recipe_id]["设施"]][scheme_data.scheme_for_recipe[recipe_id]["建筑"]]["名称"] + " * " + factory_number + is_mineralized(i)}</span></td>
            {/* 所选配方 */}
            <td><RecipeSelect item={i} onChange={change_recipe}
                choice={scheme_data.item_recipe_choices[i]} /></td>
            {/* 所选增产剂 */}
            <td><ProNumSelect onChange={change_pro_num}
                choice={scheme_data.scheme_for_recipe[recipe_id]["喷涂点数"]} /></td>
            {/* 所选增产模式 */}
            <td><ProModeSelect recipe_id={recipe_id} onChange={change_pro_mode}
                choice={scheme_data.scheme_for_recipe[recipe_id]["增产模式"]} /></td>
            {/* 所选工厂种类 */}
            <td><FactorySelect recipe_id={recipe_id} onChange={change_factory}
                choice={scheme_data.scheme_for_recipe[recipe_id]["建筑"]} /></td>
        </tr>);
    }

    for (var NPId in natural_production_line) {
        var recipe = game_data.recipe_data[item_data[natural_production_line[NPId]["目标物品"]][natural_production_line[NPId]["配方id"]]];
        var building = game_data.factory_data[recipe["设施"]][natural_production_line[NPId]["建筑"]];
        if (building in building_list) {
            building_list[building["名称"]] = Number(building_list[building["名称"]]) + Math.ceil(natural_production_line[NPId]["建筑数量"]);
        }
        else {
            building_list[building["名称"]] = Math.ceil(natural_production_line[NPId]["建筑数量"]);
        }
        if (recipe["设施"] != "巨星采集" && !(!scheme_data.energy_contain_miner && (recipe["设施"] == "采矿设备" || recipe["设施"] == "抽水设备" || recipe["设施"] == "抽油设备"))) {
            var e_cost = natural_production_line[NPId]["建筑数量"] * building["耗能"];
            if (natural_production_line[NPId]["喷涂点数"] != 0 && natural_production_line[NPId]["增产模式"] != 0) {
                e_cost *= game_data.proliferate_effect[natural_production_line[NPId]["喷涂点数"]]["耗电倍率"];
            }
            energy_cost = Number(energy_cost) + e_cost;
        }
    }

    let building_doms = Object.entries(building_list).map(([building, count]) => (
        <div key={building}>{building}：{count}</div>));

    function toggle_energy_contain_miner() {
        set_scheme_data(old_scheme_data => {
            let scheme_data = structuredClone(old_scheme_data);
            scheme_data.energy_contain_miner = !scheme_data.energy_contain_miner;
            return scheme_data;
        })
    }

    let surplus_rows = Object.entries(lp_surplus_list).map(([item, quant]) =>
        (<tr key={item}><td>{item}</td><td>{quant}</td></tr>));

    return <div className="card">
        {mineralize_doms.length > 0 && <span>原矿化列表：{mineralize_doms}</span>}
        <p>总计产能需求：</p>
        <table>
            <thead>
                <tr>
                    <th>操作</th>
                    <th>目标物品</th>
                    <th>需求产能</th>
                    <th>所需工厂数</th>
                    <th>配方选取</th>
                    <th>合成时原料喷涂点数</th>
                    <th>增产模式选择</th>
                    <th>工厂类型选择</th>
                </tr>
            </thead>
            <tbody>{result_table_rows}</tbody>
        </table>
        <p>多余产物：</p>
        <div><table>
            <thead><tr>
                <th>物品名</th>
                <th>分钟冗余量</th>
            </tr></thead>
            <tbody>{surplus_rows}</tbody>
        </table>
        </div>

        <p>建筑统计：</p>
        {building_doms}
        <p>预估电力需求下限：{energy_cost.toFixed(fixed_num)} MW
            <button className='ms-2' onClick={toggle_energy_contain_miner}>
                {scheme_data.energy_contain_miner ? "忽视" : "考虑"}采集设备耗电</button>
        </p>

    </div>;
}