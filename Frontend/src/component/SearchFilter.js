import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavItem, Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { universalSearch, searchFilterList, saveActivityLog } from '../redux/actions/httpRequest';
import { searchFilter } from '../redux/actions';
import LoadingDialog from '../component/LoadingDialog';
import utils from '../Util/Util';
import consts from '../Util/consts';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class SearchFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            filterRecord: [],
            openDropdown: false,
            searchLoader: false,
            isLoading: false,
            show: false
        };

        this.showhide = () => this.setState({ show: !this.state.show });
    }
    componentDidMount() {
        let me = this;
        document.addEventListener("click", function (event) {
            if (event.target.closest("#searchboxID")) return;
            me.setState({ openDropdown: false, filterRecord: [], searchValue: '' })
        });
    }

    updateInputValue(evt) {
        this.setState({
            searchValue: evt.target.value
        });
    }

    globalSearch() {
        const { searchValue } = this.state;
        if (searchValue == "") {
            return;
        }
        this.setState({ isLoading: true, show: false });
        let params = {
            page: 1,
            pageSize: 10,
            populate: undefined,
            sort: undefined,
            sortDir: undefined,
            filterText: searchValue,
            filters: utils.searchValueFilter(searchValue),
            combos: undefined,
            query: searchValue
        };
        params = utils.updateSiteAndTagsFilter(this, params);
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), { pathname: "/search" }, consts.Search + searchValue);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(searchFilter({ filter: params.filters }));
        this.props.dispatch(universalSearch.request(params));
        this.context.router.history.replace(`/search/${searchValue}`);
    }

    globalFilterList = (event) => {
        let me = this;
        clearTimeout(me.timer);
        let { value } = event.target;
        let params = {
            populate: undefined,
            sort: undefined,
            sortDir: undefined,
            filters: utils.searchValueFilter(value),
            combos: undefined,
            filterText: value
        };
        params = utils.updateSiteAndTagsFilter(this, params);
        me.setState({ searchValue: value, searchLoader: (value.trim() != "" ? (value && true) : false) }, () => {
            me.timer = setTimeout(function () {
                if (value.trim() != "") {
                    me.props.dispatch(searchFilterList.request(params));
                } else {
                    me.setState({ openDropdown: false });
                }
            }, 500)
        })
    }

    globalFilterSearch = (val) => {
        this.setState({ searchValue: val, openDropdown: false }, () => {
            this.globalSearch()
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.searchFilterList && !nextProps.searchFilterList.isFetching && nextProps.searchFilterList != this.props.searchFilterList) {
            if (nextProps.searchFilterList.data && !nextProps.searchFilterList.data.error && nextProps.searchFilterList.data.records) {
                this.setState({ filterRecord: nextProps.searchFilterList.data.records, openDropdown: this.state.searchValue != "" ? true : false, searchLoader: false });
            }
            else {
                this.setState({ searchLoader: false, filterRecord: [] });
            }
        }

        if (nextProps.universalSearch && !nextProps.universalSearch.isFetching && nextProps.universalSearch != this.props.universalSearch) {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { globalFilterList, state, globalFilterSearch } = this;
        const { searchValue, filterRecord, openDropdown, searchLoader, isLoading } = state;
        return (
            <React.Fragment>
                <LoadingDialog isOpen={isLoading} />
                <NavItem className="px-2">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        this.globalSearch();
                    }}>
                        <InputGroup className="header-search">
                            <Input placeholder="Search" value={searchValue} onChange={evt => globalFilterList(evt)} />
                            <div className={!searchValue ? 'auto-suggetion-wraper-no-data' : 'auto-suggetion-wraper'}>
                                {searchLoader && <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>}
                                <ul id="searchboxID" className={openDropdown ? 'searchboxPanel' : ''}>
                                    {openDropdown &&
                                        filterRecord.map((v, i) => {
                                            return <li onClick={() => globalFilterSearch(v)} key={i}>{v}</li>
                                        })
                                    }
                                </ul>
                            </div>
                            {/* <i onClick={this.showhide} className="fa fa-2x appSearchIcon icon2-search-icon" /> */}

                        </InputGroup>
                           
                        
                    </form>
                </NavItem>
            </React.Fragment>
        )

    }
}
SearchFilter.contextTypes = {
    router: PropTypes.object.isRequired
};
SearchFilter.propTypes = propTypes;
SearchFilter.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
    return {
        universalSearch: state.universalSearch,
        storesData: state.storesData,
        searchFilterList: state.searchFilterList
    };
}
var SearchFilterModule = connect(mapStateToProps)(SearchFilter);
export default SearchFilterModule;
