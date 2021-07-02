import React from 'react';

export default function TooltipContent(props) {
    const { userInfo } = props;
    let renderUserRecords = (item, index) => {
        return (
            <tr key={index}>
                <td className={'text-left'}>{item.Name}</td>
                <td>&emsp;</td>
                <td>{Number(item.RecognizeScore).toFixed(2) + '%'}</td>
            </tr>
        )
    }

    return <tbody>
        {userInfo && userInfo.length > 0 &&
            userInfo.map(renderUserRecords, this)
        }
    </tbody>
};