import { randomId } from "@/utils";

const processChildren = (field) => {
    const valueMap = field.choices.reduce((agg, choice) => {
        return {
            ...agg,
            [choice.value.split("_")[0]]: (data) =>
                data[field.name] == choice.value,
        };
    }, {});

    return field.childs.reduce((agg, child) => {
        let childFields = [];
        if (child.choices?.length && child.childs?.length)
            childFields = processChildren(child);

        childFields = childFields.flat();

        return [
            ...agg,
            { ...child, show: valueMap[child.trigger] },
            ...childFields,
        ];
    }, []);
};

export default function ({ fields: _fields, data, noGroups, fullWidthFields }) {
    if (!_fields) return;

    let fields = _fields.reduce((agg, field) => {
        let childFields = [];
        if (field.choices?.length && field.childs?.length)
            childFields = processChildren(field);

        childFields = childFields.flat();

        return [...agg, field, ...childFields];
    }, []);

    return fields.reduce((agg, field) => {
        let { name, type, label, choices, defaultValue, ...fieldProps } = field;
        let dataValue = data?.[name];

        const computedDefaultValue = dataValue ?? defaultValue;

        if (!fullWidthFields) {
            fieldProps.width =
                fieldProps.width ??
                (["textarea", "checkbox", "bool"].includes(field.type) ||
                    label == "On what frequency would you remit your saving?")
                    ? "full"
                    : "half";
        }

        let fullField = {
            __id: "id" + randomId(),
            name,
            label: label || name,
            type,
            choices,
            defaultValue: computedDefaultValue,
            value: computedDefaultValue,
            ...fieldProps,
        };

        const group = field?.group;

        if (!noGroups && group) {
            if (group?.checklist !== "None") {
                const existingGroup = agg.findIndex(
                    ({ checklist }) => checklist == group.checklist
                );

                if (existingGroup != -1)
                    agg[existingGroup].children.push(fullField);
                else {
                    agg.push({
                        ...field.group,
                        type: "group",
                        children: [fullField],
                    });
                }
            } else if (agg.at(-1)?.id == "None") {
                agg.at(-1).children.push(fullField);
            } else {
                agg.push({
                    ...field.group,
                    type: "group",
                    children: [fullField],
                });
            }

            return agg;
        }

        agg.push(fullField);

        return agg;
    }, []);
}
