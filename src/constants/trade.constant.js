const TRADE_LIST = '/';
const TRADE_CREATE = '/create';
const TRADE_POST_DETAIL = '/:tradeId';
const TRADE_EDIT = '/:tradeId/edit';
const TRADE_DELETE = '/:tradeId/delete';

const routes = {
    tradeList : TRADE_LIST,
    tradeCreate : TRADE_CREATE,
    tradePostDetail : tradeId => {
        if(tradeId) return `/${tradeId}`;
        return TRADE_POST_DETAIL;
    },
    tradeEdit : tradeId => {
        if(tradeId) return `/${tradeId}/edit`;
        return TRADE_EDIT;
    },
    tradeDelete : tradeId => {
        if(tradeId) return `/${tradeId}/delete`;
        return TRADE_DELETE;
    }
};

export default routes;