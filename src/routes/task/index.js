import { h, Component } from 'preact';
import { route } from 'preact-router';
import { observer } from 'preact-mobx';
import { firestore, auth } from '../../lib/firebase';
import style from './style';

@observer
export default class Task extends Component {

	removeTask(task) {

		const oldTask = {
			body: task.body,
			due: task.due,
			subject: task.subjectRef,
			title: task.title
		};

		firestore
			.collection('users')
			.doc(auth.currentUser.uid)
			.collection('tasks')
			.doc(task.id)
			.delete()
			.then(() => {
				route('/tasks');
				this.props.stores.uiStore.showSnackbar('Task deleted', 'UNDO', 7000, () => {
					firestore.collection('users')
						.doc(auth.currentUser.uid)
						.collection('tasks')
						.doc(task.id)
						.set(oldTask)
						.then(() => this.props.stores.uiStore.showSnackbar('Task restored', null, 2500))
						.catch((e) => this.props.stores.uiStore.throwError('#005', 'Error restoring task'));
				});
			})
			.catch((e) => this.props.stores.uiStore.throwError('#003', 'Error deleting task'));
	}

	constructor() {
		super();
		this.state = {
			task: null
		};
	}
  
	componentDidMount() {
		if (this.props.stores.taskStore.tasks) {
			this.props.stores.taskStore.tasks.forEach((task) => {
				if (task.id === this.props.task) this.setState({ task });
			});
		}
		
		if (this.state.task) {
			this.props.stores.uiStore = {
				...this.props.stores.uiStore,
				headerTitle: this.state.task.title,
				headerAction: () => this.removeTask(this.state.task).bind(this),
				headerActionIcon: 'delete'
			};
		}
		else {
			this.props.stores.uiStore = {
				...this.props.stores.uiStore,
				headerTitle: 'class not found: ' + this.props.task,
				headerAction: null,
				headerActionIcon: null
			};
		}
		
		const navbtn = document.getElementById('navbtn');
		const header = document.getElementById('header');
		if (navbtn) navbtn.setAttribute('id', 'navbtn-arrow');
		if (header) header.setAttribute('id', 'header-big');
	}
  
	componentWillUnmount() {
		this.props.stores.uiStore = {
			...this.props.stores.uiStore,
			headerTitle: null,
			headerAction: null,
			headerActionIcon: null
		};
		const navbtn = document.getElementById('navbtn-arrow');
		const header = document.getElementById('header-big');
		if (navbtn) navbtn.setAttribute('id', 'navbtn');
		if (header) header.setAttribute('id', 'header');
	}

	render() {

		const { tasks } = this.props.stores.taskStore;
		let currentTask = null;

		tasks.forEach((task) => {
			if (task.id === this.props.task) currentTask = task;
		});

		return (
			<div class={style.task + ' fadeIn'}>
				{currentTask ? <div>
					<div class={style.listElement}>
						<i class="material-icons">&#xE80C;</i>
						<span>{currentTask.body}</span>
					</div>
					<div class={style.listElement}>
						<i class="material-icons">&#xEB3F;</i>
						<span>{currentTask.title}</span>
					</div>
				</div> : <div>
					Task not found: {this.props.task}
				</div>}
			</div>
		);
	}
}