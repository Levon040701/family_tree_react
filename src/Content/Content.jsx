import FamilyTree from "@balkangraph/familytree.js";
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

const Content = () => {
    const createMember = (person, columns) => {
        const personObj = {};
        for (let i = 0; i < columns.length; i++) {
            if (columns[i] === 'pids' || columns[i] === 'divorced') {
                personObj[columns[i]] = person[i] ? person[i].split(',').map(element => {return +element}) : [];
            } else {
                if ( person[i] && !isNaN(+person[i]) ) {
                    personObj[columns[i]] = +person[i];
                } else {
                    personObj[columns[i]] = person[i];
                }
            }
        }

        return personObj;
    };

    FamilyTree.SEARCH_PLACEHOLDER = "Искать...  Введите \"?\" для справки.";
    FamilyTree.elements.customTextarea = (data, editElement) => {
        let id = FamilyTree.elements.generateId();
        let value = data[editElement.binding];
    
        if (!value) {
            return {html: ''};
        }
    
        return {
            html: `<label for='${id}'></label>
                    <textarea
                        readonly
                        id='${id}'
                        name='${id}'
                        style="width: 100%; height: 100px; padding: 5px 10px; text-align: left;"
                        data-binding='${editElement.binding}'
                    >${value}</textarea>`,
            id,
            value
        };
    };

    const apiKey = 'AIzaSyC3EwDC3znzCEj_kgzKphExAFxeRFim8GA';
    const ID = '1BEAojfHoNVKSykooc-gVoHaBLqzg5DpmiXdnhOThrt4';
    const NAME = 'tree_sheet';
    const URL = `https://sheets.googleapis.com/v4/spreadsheets/${ID}/values/${NAME}/?alt=json&key=${apiKey}`;

    const [ members, setMembers ] = useState([]);
    const [ family, setFamily ] = useState({});
    const divRef = useRef(null);

    useEffect(() => {
        axios.get(URL).then(({data}) => {
            console.log(data);
            const columns = data.values[0];
            const people = data.values.slice(1);
            for (let i = 0; i < people.length; i++) {
                members.push(createMember(people[i], columns));
                if (!members[i].name){
                    let firstName = members[i].fullName.split(' ')[0];
                    if (firstName === '...') {
                        members[i].name = '';
                        members[i].fullName = members[i].fullName.slice(4);
                    } else {
                        members[i].name = firstName;
                    }
                }
                members[i].fullName = members[i].fullName.trim();
                let start = members[i].bD ? new Date(members[i].bD) : undefined;
                let end = members[i].dD !== 'a' ? new Date(members[i].dD) : new Date();
                members[i].age = (new Date(end - start)).getFullYear() - new Date(0).getFullYear() || '-';
                if (!members[i].bD && !members[i].dD) {
                    members[i].dates = '';
                } else {
                    members[i].dates = (members[i].bD || '');
                    if (members[i].dD !== 'a') {
                        members[i].dates += ' — ' + (members[i].dD || '');
                    }
                }
            }
        
            setMembers([...members]);
        });
    }, [URL]);

    useEffect(() => {
        setFamily(new FamilyTree(divRef.current, {
            template: "hugo",
            nodes: members,
            nodeBinding: {
                field_0: "name",
                field_1: "age"
            },
            editForm: {
                titleBinding: 'name',
                photoBinding: 'ImgUrl',
                generateElementsFromFields: false,
                elements: [
                    {type: 'textbox', label: 'Полное имя', binding: 'fullName'},
                    {type: 'textbox', label: '', binding: 'dates'},
                    {type: 'textbox', label: 'Возраст', binding: 'age'},
                    {type: 'customTextarea', label: 'Описание', binding: 'desc'},
                ]
            },
            searchFields: ["name", "fullName", "gender"]
        }));
    }, [members])

    useEffect(() => {
        if (Object.keys(family).length) {
            family.on('render-link', function (sender, args) {
                let cnodeData = family.get(args.cnode.id);
                let nodeData = family.get(args.node.id);
                if (cnodeData.divorced != undefined && nodeData.divorced != undefined &&
                    cnodeData.divorced.includes(args.node.id) && nodeData.divorced.includes(args.cnode.id)) {
                        args.html = args.html.replace("path", "path stroke-dasharray='3, 2'");
                    }
                }
            );
        }
    }, [family]);

    return (
        <div id="tree" ref={divRef}></div>
    );
};

export default Content;

