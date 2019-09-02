//=============================================================================
// AT_HideSkillCommands.js
//=============================================================================
/*:
 * @plugindesc v1.03 根据技能类型ID在战斗界面隐藏指定的技能类型
 * @author ArchmageTony
 *
 * @param HideSkillCommandsID
 * @type Number[]
 * @desc 填写技能类型的数字ID，每行一个。
 * @default []
 *
 * @param --隐藏技能类型菜单--
 * @default
 *
 * @param HideSealedSkillCommands
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Enable - 开启自动隐藏被封印的技能类型，Disable - 关闭自动隐藏被封印的技能类型
 * @default false
 *
 * @param DisableSealedSkillCommands
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Enable - 当技能被封印时该技能类型菜单变为灰色不可打开（仅HideSealedSkillCommands选项为false时有用）Disable - 效果相反
 * @default false
 *
 * @param --隐藏物品菜单--
 * @default
 *
 * @param HideItemCommand
 * @type boolean
 * @on 隐藏
 * @off 灰色不可用
 * @desc 当通过状态封印使用物品时：隐藏 - 隐藏物品菜单，灰色不可用 - 使物品菜单不可用
 * @default true
 *
 * @help
 * 不敢保证与其它的战斗界面修改插件相互兼容，请尽量保持此插件在其它修改界面菜单插件的下面以达到最好的效果。
 * 有以下方法可以隐藏战斗界面的技能类型：
 * 1、通过在插件内输入指定的技能类型ID来隐藏，隐藏后所有人的战斗菜单都会隐藏这种技能类型，每行填写一个。
 * 仅支持RPG Maker MV 1.5.0以上，因为变量填写使用了List。
 *
 * 2、根据状态隐藏指定的技能类型，在状态的备注栏中输入：
 * <AT_HideCommands:x>
 * 其中x代表的是技能类型ID，可以同时写多个，用英文逗号隔开。
 *
 * 3、根据状态隐藏物品菜单，在备注栏中输入：
 * <AT_HideCommands:Item>
 *
 * 4、HideSealedSkillCommands选项：当某个技能类型被某个状态封印时（非使用备注标签）是否隐藏这个技能类型菜单，开启时隐藏，关闭时不隐藏。
 *
 * 5、DisableSealedSkillCommands选项：当某个技能类型被某个状态封印时（非使用备注标签）是否将这个技能类型菜单变成灰色不可用，注意若上面的那个选项开启了的话这个选项就无效了，因为菜单都被隐藏了变成灰的你也看不见=、=
 *
 * 6、HideItemCommand选项：当在状态备注中使用标签隐藏物品菜单时，是直接隐藏还是使其变为灰色不可用。
 *
 *-----------------------------------------------------------------------------
 * 更新履历
 *-----------------------------------------------------------------------------
 * v1.03：20190902：
 * - 修复了一些bug
 *
 * v1.02：20190901：
 * - 增加一个额外选项用于是否隐藏角色被封印的技能类型
 * - 增加一个额外选项用于设置被封印技能菜单是隐藏还是被设置为灰色不可用
 *
 * v1.01：20190831：
 * - 重命名脚本名称。
 * - 增加根据状态隐藏技能类型的功能。
 * - 增加根据技能状态隐藏物品菜单的功能。
 *
 * v1.00：20190830：
 * - 脚本完成。
 */
var Imported = Imported || {};
Imported.AT_HideSkillCommands = true;
var AT = AT || {};
AT.parameters = PluginManager.parameters('AT_HideSkillCommands');
AT.hideSealedSkillCommands = eval(String(AT.parameters['HideSealedSkillCommands']));
AT.disableSealedSkillCommands = eval(String(AT.parameters['DisableSealedSkillCommands']));
AT.hideItemCommand = eval(String(AT.parameters['HideItemCommand']));
AT.hideSkillCommandIDs = JSON.parse(AT.parameters['HideSkillCommandsID'])
/**
 * 重写添加技能菜单方法
 */
Window_ActorCommand.prototype.addSkillCommands = function () {
    var skillTypes = this._actor.addedSkillTypes();
    this._actor.states().some(function (state) {
        AT.hideSkillCommandID = [];
        //读取state里面的备注（note）并添加到hSCID中
        readObjectMeta(state, ['AT_HideCommands']).split(",").forEach(function (hCID) {
            if (hCID !== ('') && hCID !== ('Item')) {
                AT.hideSkillCommandIDs.push(hCID);
            }
        });
        //去重
        let hSCIDObj = {};
        for (let i of AT.hideSkillCommandIDs) {
            if (!hSCIDObj[i.toString()]) {
                AT.hideSkillCommandID.push(i);
                hSCIDObj[i] = 1;
            }
        }
    });
    skillTypes.sort(function (a, b) {
        return a - b
    });
    skillTypes.forEach(function (stypeId) {
        var name = $dataSystem.skillTypes[stypeId];
        //判断封印隐藏开关是否已经打开
        if (AT.hideSealedSkillCommands) {
            //在此处判断一下是否有需要隐藏的技能类型ID，同时要求该技能没有被封印
            if (AT.hideSkillCommandID.indexOf(stypeId.toString()) === -1 && !this._actor.isSkillTypeSealed(stypeId)) {
                this.addCommand(name, 'skill', true, stypeId);
            }
        } else {
            //在此处判断一下是否有需要隐藏的技能类型ID，没有的话绘制
            if (AT.hideSkillCommandID.indexOf(stypeId.toString()) === -1) {
                this.addCommand(name, 'skill', (AT.disableSealedSkillCommands ? (!this._actor.isSkillTypeSealed(stypeId)) : true), stypeId);
            }
        }
    }, this);
};

/**
 * 重写添加物品菜单方法
 */
Window_ActorCommand.prototype.addItemCommand = function () {
    let hideItem = false;
    //读取state里面的备注（note）
    this._actor.states().some(function (state) {
        if (readObjectMeta(state, ['AT_HideCommands']) === 'Item') {
            hideItem = true;
        }
    });
    if (hideItem) {
        if (!AT.hideItemCommand) {
            this.addCommand(TextManager.item, 'item', false);
        }
    } else {
        this.addCommand(TextManager.item, 'item');
    }
};

/**
 * 读取状态备注中的内容，使用正则表达式判断，其中要求必须要有英文冒号
 * @param obj 参数输入为状态
 * @param metacodes 需要读取的内容信息
 * @returns {*}
 */
var readObjectMeta = function (obj, metacodes) {
    if (!obj) return false;
    var match = {};
    metacodes.some(function (metacode) {
        var metaReg = new RegExp('<' + metacode + ':[ ]*(.+)>', 'i');
        match = metaReg.exec(obj.note);
        return match;
    });
    return match ? match[1] : '';
};

