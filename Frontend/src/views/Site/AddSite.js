import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { siteData, cameraData, sitesData } from '../../redux/actions/httpRequest';
import { siteChange } from './../../redux/actions';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import swal from 'sweetalert';
import classnames from 'classnames';
import Grid from '../Grid/GridBase';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import consts from '../../Util/consts'

export class AddSite extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			columns: [
				{ key: 'name', name: 'Name', width: 150, filter: true, sort: true },
				{ key: 'place', name: 'Place', width: 150, filter: true, sort: true },
				{ key: 'cameraIP', name: 'Camera IP', width: 150, filter: true, sort: true },
				{ key: 'cameraImageUrl', name: 'Camera Image Url', width: 150, filter: true, sort: true, formatter: this.getCameraImageUrl.bind(this) },
				{ key: 'cameraRTSPUrl', name: 'Camera Url', width: 150, filter: true, sort: true },
				{ key: 'status', name: 'Status', filter: true, sort: true, width: 100 }
			],
			tags: []
		}

		this.onSave = this.onSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.isUpdate = this.props.match.params.id !== "0";
		// camera function
		this.addCamera = this.addCamera.bind(this);
		this.handleTagChange = this.handleTagChange.bind(this);
	}

	getCameraImageUrl(value, data, index) {
		return !(data.imageEnabled === "false" || !data.imageEnabled) ? data.cameraImageUrl : ""
	}

	componentWillMount() {
		// localStorage.removeItem("currentPage");
	}

	componentDidMount() {
		let { params } = this.props.match
		if (params.id !== "0") {
			this.props.dispatch(siteData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
			this.props.dispatch(cameraData.request({ action: 'load', filters: [{ "value": params.id, "property": "siteId", "type": "string" }] }));
		} else {
			this.props.dispatch(siteData.request({ action: 'load', id: this.props.match.params.id }));
		}
	}

	componentWillReceiveProps(nextProps) {
		let { params } = this.props.match;
		let { storeId, id } = params;

		if (nextProps && nextProps.initialValues && nextProps.initialValues.tags && nextProps.initialValues.tags.length > 0) {
			this.setState({ tags: nextProps.initialValues.tags.split(",") })
		}

		if ((nextProps.siteData && nextProps.siteData !== this.props.siteData)) {
			let { data, isFetching, error } = nextProps.siteData;
			if (!isFetching) {
				if (error || data && data.errmsg) {
					swal({ title: "Error", text: error || data.errmsg, icon: "error", });
					return;
				}

				if (nextProps.siteData.data && nextProps.siteData.data.message) {
					swal({
						title: utils.getAlertBoxTitle(nextProps.siteData.data.success),
						text: nextProps.siteData.data.message,
						icon: utils.getAlertBoxIcon(nextProps.siteData.data.success)
					}).then(function () {
						this.props.dispatch(siteData.request({ action: 'load', id: storeId }, storeId));
						this.props.dispatch(sitesData.request({ stores: [] }));
					}.bind(this));
				}
			}
		}

		if ((nextProps.sitesData && nextProps.sitesData !== this.props.sitesData)) {
			let { data, isFetching } = nextProps.sitesData;
			if (!nextProps.sitesData.isFetching) {
				if (data) {
					this.props.dispatch(siteChange({ data: nextProps.sitesData.data.data }));
					this.props.history.goBack(-1)
				}
			}
		}
	}

	onCancel = () => {
		this.props.history.goBack(-1)
	}

	onSave(values, { setSubmitting }) {
		setSubmitting(false);
		let { params } = this.props.match;
		let { storeId, id } = params;
		let { tags } = this.state;
		if (id === "0") {
			values.tags = tags.toString();
			values.storeId = storeId;
			this.props.dispatch(siteData.request({ action: 'save', data: values }, id));
		} else {
			values.tags = tags.toString();
			values.storeId = storeId;
			utils.deleteUnUsedValue(values);
			this.props.dispatch(siteData.request({ action: 'update', data: values }, id));
		}
	}

	onDelete = () => {
		swal({
			title: "Are you sure?",
			text: "Once deleted, you will not be able to recover this site",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		}).then(function (willDelete) {
			let id = this.props.match.params.id;
			if (willDelete) {
				this.props.dispatch(siteData.request({ action: 'delete' }, id))
			}
		}.bind(this));
	}

	getInitialValueTemplate() {
		return {
			name: "",
			storeId: "",
			status: ""
		}
	}

	// click on cammera list record
	onRowClick(index, record) {
		let { params } = this.props.match;
		let { storeId } = params;
		if (this.alreadyclicked) {
			this.alreadyclicked = false;
			this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
			this.context.router.history.push('/admin/sites/addcamera/' + params.id + "/" + storeId + '/' + record._id);
		}
		else {
			this.alreadyclicked = true;
			this.alreadyclickedTimeout = setTimeout(() => {
				this.alreadyclicked = false;
			}, 300);
		}
	}

	addCamera = () => {
		let { params } = this.props.match;
		let { storeId } = params;
		this.props.history.push("/admin/sites/addcamera/" + params.id + "/" + storeId + "/0");
	}

	handleTagChange(tag) {
		this.setState({ tags: tag });
	}

	render() {
		const { state, onCancel, props, onDelete, isUpdate, addCamera } = this;
		const { columns, tags, activeTab } = state;
		const { listAction, actionName, sortColumn, sortDirection, localPaging, match, initialValues } = props;
		const { name } = initialValues || { name: '' };
		const { Status } = consts
		const initialValuesEdit = isUpdate ? initialValues : {
			name: "",
			storeId: "",
			status: ""
		};

		const siteId = match && match.params && Number(match.params.id);

		let options = [
			{ value: Status.Active, label: Status.Active },
			{ value: Status.Inactive, label: Status.Inactive }
		];

		let { siteData } = this.props;
		let isFetching = siteData && siteData.isFetching;
		isFetching = isFetching || siteData && siteData.isFetching;

		return (
			<div className="animated fadeIn">
				<LoadingDialog isOpen={isFetching} />
				<Formik
					enableReinitialize={true}
					initialValues={initialValuesEdit}
					onSubmit={this.onSave}
					validationSchema={
						Yup.object().shape({
							name: Yup.string().trim().required('Required'),
							status: Yup.string().trim().required('Required')
						})
					}>
					{function (props) {
						const {
							values,
							touched,
							errors,
							isSubmitting,
							handleChange,
							handleBlur,
							handleSubmit
						} = props;
						return (
							<Row>
								<Col md={12}>
									<form onSubmit={handleSubmit}>
										<CardWrapper lg={12} title={isUpdate ? (name) : 'Create new site'} footer={
											<div className={'form-button-group'}>
												<div><button type="submit" className="btn btn-success" disabled={isSubmitting}>Save</button></div>
												<div> <button type="button" className="btn btn-primary" onClick={onCancel} disabled={isSubmitting}>Cancel</button></div>
												{isUpdate && <div> <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isSubmitting}>Delete</button></div>}
											</div>
										}>
											<FormGroup row>
												<Label htmlFor="name" sm={2}>Name<span className={'text-danger'}>*</span></Label>
												<Col sm={6}>
													<Input
														id="name"
														placeholder="Enter Name"
														type="text"
														value={values.name}
														onChange={handleChange}
														onBlur={handleBlur}
														className="form-control"
													/>
													{errors.name && <div className="input-feedback">{errors.name}</div>}
												</Col>
											</FormGroup>
											<FormGroup row>
												<Label htmlFor="name" sm={2}>Tag</Label>
												<Col sm={6}>
													<TagsInput inputProps={{ placeholder: tags.length > 0 ? '' : 'Add a tag' }} value={tags} onChange={this.handleTagChange} onBlur={this.handleTagChange} addOnBlur={true} />
												</Col>
											</FormGroup>
											<FormGroup row>
												<Label htmlFor="status" sm={2}>Status<span className={'text-danger'}>*</span></Label>
												<Col sm={6}>
													<Input id="status" type="select" value={values.status} onChange={handleChange} onBlur={handleBlur}>
														<option value="">Please Select</option>
														{
															options.map((option, index) => {
																return <option key={index} value={option.value}>{option.label}</option>
															})
														}
													</Input>
													{errors.status && <div className="input-feedback">{errors.status}</div>}
												</Col>
											</FormGroup>
										</CardWrapper>
									</form>
								</Col>
							</Row>
						);
					}.bind(this)}
				</Formik>
				{isNaN(siteId) || siteId ? <div className="child-record">

					<Nav tabs>
						<NavItem>
							<NavLink className={classnames({ active: true })}>Camera </NavLink></NavItem>
					</Nav>
					<TabContent activeTab={activeTab}>
						<TabPane>
							<Row>
								<Col>
									<Grid
										listAction={listAction}
										dataProperty={actionName}
										columns={columns}
										autoHeight={true}
										filename ={"Camera"}
										defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
										localPaging={localPaging || false}
										onRowClick={this.onRowClick.bind(this)}
										exportButton={true}	
										add={addCamera}
										pageProps={localStorage.getItem("currentPage")}
										filters={[{ "value": this.props.match.params.id, "property": "siteId", "type": "string" }]}
									/>
								</Col>
							</Row>
						</TabPane>
					</TabContent>
				</div> : null}
			</div>
		)
	}
}

AddSite.defaultProps = {
	listAction: cameraData,
	actionName: 'cameraData'
}

AddSite.contextTypes = {
	router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
	return {
		initialValues: state.siteData.data || {},
		siteData: state.siteData,
		cameraData: state.cameraData,
		sitesData: state.sitesData
	};
}

var AddSiteModule = connect(mapStateToProps)(AddSite);
export default AddSiteModule;