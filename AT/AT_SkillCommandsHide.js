//=============================================================================
// AT_SkillCommandsHide.js
//=============================================================================
/*:
 * @plugindesc v1.0 根据技能类型ID在战斗界面隐藏指定的技能类型
 * @author ArchmageTony
 *
 * @param HideCommandSkillID
 * @type Number[]
 * @desc 填写技能类型的数字ID，每行一个。
 * @default []
 *
 * @help
 * 隐藏技能类型，每行填写一个。
 * 仅支持RPG Maker MV 1.5.0以上，因为变量填写使用了List。
 */
var Imported = Imported || {};
Imported.AT_SkillCommandsHide = true;
var AT = {};
AT.parameters = PluginManager.parameters('AT_SkillCommandsHide');
AT.skillIDHide = JSON.parse(AT.parameters['HideCommandSkillID']);
//重写添加技能类型方法
Window_ActorCommand.prototype.addSkillCommands = function () {
    var skillTypes = this._actor.addedSkillTypes();
    skillTypes.sort(function (a, b) {
        return a - b
    });
    skillTypes.forEach(function (stypeId) {
        var name = $dataSystem.skillTypes[stypeId];
        //在此处判断一下是否有需要隐藏的技能类型ID，没有的话绘制
        if (AT.skillIDHide.indexOf(stypeId.toString()) === -1) {
            this.addCommand(name, 'skill', true, stypeId);
        }
    }, this);
};

